import type { Metadata, ResolvingMetadata } from "next";
import {
  getProjectAmenities,
  getProjectBuildingsWithFloorPlans,
  getProjectDetails,
  getProjectDeveloper,
  getProjectMasterPlanPoints,
  getProjectTranslations
} from "@/features/actions/projects/get-project.action";

import ProjectPageContent from "@/components/projects/ProjectDetail/ProjectDetail";
import type { ProjectTranslation } from "@prisma/client";
import { getBuildingsWithFloorPlans } from "@/features/actions/buildings/buildings.action";
import { getProject } from "@/lib/api/projects";
import { getProjectBuildingsData } from "@/features/actions/unique-actions/get-project-buildings-data";

type Props = {
  params: { id: string; locale: string };
};

const isVideo = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".m3u8"];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  let project;
  try {
    project = await getProject(id);
  } catch (error) {
    console.error(`Failed to fetch project ${id} for metadata:`, error);
    return {
      title: "Error fetching project",
      description: "Could not load project details."
    };
  }

  if (!project) {
    return {
      title: "Project not found",
      description: "The requested project could not be found."
    };
  }

  const mainImageUrl = project?.images?.[0]?.url;
  // const shouldPreloadMainImage = !isVideo(mainImageUrl) && !!mainImageUrl;

  const previousImages = (await parent).openGraph?.images || [];

  const translations = await getProjectTranslations(id);
  let currentTranslation;
  if (translations && translations.length > 0) {
    currentTranslation =
      translations.find(t => t.language === params.locale) || translations[0];
  } else {
    if (project?.translations && project.translations.length > 0) {
      currentTranslation =
        project.translations.find(
          (t: ProjectTranslation) => t.language === params.locale
        ) || project.translations[0];
    }
  }

  const metadata: Metadata = {
    title: currentTranslation?.name || project?.name || "Project Details",
    description:
      currentTranslation?.description ||
      project?.description ||
      "Project description",
    openGraph: {
      title: currentTranslation?.name || project?.name || "Project Details",
      description:
        currentTranslation?.description ||
        project?.description ||
        "Project description",
      images: mainImageUrl ? [mainImageUrl, ...previousImages] : previousImages
    }
  };

  // Убираем добавление preload link
  // if (shouldPreloadMainImage && mainImageUrl) {
  //     metadata.other = {
  //       ...metadata.other,
  //       'custom-preload-image': `<link rel="preload" as="image" href="${mainImageUrl}" fetchpriority="high" />`
  //     };
  // }

  return metadata;
}

export default async function ProjectPage({ params }: Props) {
  const { id, locale } = params;

  let project,
    translations,
    developer,
    amenities,
    masterPlanPoints,
    buildingsWithFloorPlans,
    projectDetails,
    projectBuildingsData;
  try {
    project = await getProject(id);
    if (!project) {
      console.error(`Project with id ${id} not found.`);
      return <div>Project not found</div>;
    }
    translations = await getProjectTranslations(id);
    if (!project.developerId) {
      console.error(`Developer ID missing for project ${id}`);
      developer = null;
    } else {
      developer = await getProjectDeveloper(project.developerId);
    }
    amenities = await getProjectAmenities(id);
    masterPlanPoints = await getProjectMasterPlanPoints(id);
    buildingsWithFloorPlans = await getProjectBuildingsWithFloorPlans(id);
    projectDetails = await getProjectDetails(id);
    projectBuildingsData = await getProjectBuildingsData(id);
  } catch (error) {
    console.error(`Failed to load data for project ${id}:`, error);
    return <div>Failed to load project data. Please try again later.</div>;
  }

  let currentTranslation: ProjectTranslation | undefined;

  if (translations && translations.length > 0) {
    currentTranslation = translations.find(t => t.language === locale);
    if (!currentTranslation) {
      console.warn(
        `Translation for locale '${locale}' not found, using default.`
      );
      currentTranslation = translations[0];
    }
  } else {
    if (project?.translations && project.translations.length > 0) {
      currentTranslation = project.translations.find(
        (t: ProjectTranslation) => t.language === locale
      );
      if (!currentTranslation) {
        console.warn(
          `Translation for locale '${locale}' not found in project data, using default.`
        );
        currentTranslation = project.translations[0];
      }
    }
  }

  if (!currentTranslation) {
    console.warn(`No translations found for project ${id}, creating fallback.`);
    currentTranslation = {
      id: `fallback-${id}-${locale}`,
      projectId: id,
      language: locale,
      name: project?.name || "Untitled Project",
      description: project?.description || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  console.log("currentTranslationPAGE", currentTranslation);

  if (!project || !currentTranslation) {
    console.error(
      "Missing critical data for ProjectPageContent render (Project or Translation missing)."
    );
    return <div>Error loading project content.</div>;
  }

  return (
    <ProjectPageContent
      project={project}
      developer={developer}
      amenities={amenities || []}
      masterPlanPoints={masterPlanPoints || []}
      buildingsWithFloorPlans={buildingsWithFloorPlans || []}
      projectDetails={projectDetails}
      projectBuildingsData={projectBuildingsData || []}
      currentTranslation={currentTranslation}
      projectSlider={"show"}
    />
  );
}
