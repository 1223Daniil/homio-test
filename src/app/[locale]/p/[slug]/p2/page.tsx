import {
  getProjectAmenities,
  getProjectBuildingsWithFloorPlans,
  getProjectDetails,
  getProjectDeveloper,
  getProjectMasterPlanPoints,
  getProjectTranslations
} from "@/features/actions/projects/get-project.action";

import { Metadata } from "next";
import ProjectPagePublic from "@/components/projects/ProjectDetail/ProjectDetailPublic";
import { formatNumberType } from "@/utils/formatPrice";
import { getBuildingsWithFloorPlans } from "@/features/actions/buildings/buildings.action";
import { getProjectBuildingsData } from "@/features/actions/unique-actions/get-project-buildings-data";
import { getProjectBySlug } from "@/lib/api/projects";
import { headers } from "next/headers";

// Функция для генерации метаданных
export async function generateMetadata({
  params
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found."
    };
  }

  const translations = await getProjectTranslations(project.id);
  const currentTranslation =
    translations?.find(t => t.language === params.locale) || translations?.[0];

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const canonicalUrl = `${protocol}://${host}/${params.locale}/p/${params.slug}`;

  const title = currentTranslation?.name || project.name || "Project Details";
  const description =
    currentTranslation?.description?.substring(0, 160) ||
    `Details about ${title}`;

  const ogImage =
    project.media?.find(m => m.type === "image")?.url ||
    "/placeholder-image.jpg";

  return {
    metadataBase: new URL(protocol + "://" + host),
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
      languages: {}
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: "Homio",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: `${title} image`
        }
      ],
      locale: params.locale,
      type: "website"
    }
  };
}

export default async function ProjectPage({
  params
}: {
  params: { slug: string; locale: string };
}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return <div>Project not found</div>;
  }

  const translations = await getProjectTranslations(project.id);
  const developer = await getProjectDeveloper(project.developerId);
  const amenities = await getProjectAmenities(project.id);
  const masterPlanPoints = await getProjectMasterPlanPoints(project.id);
  const buildingsWithFloorPlans = await getProjectBuildingsWithFloorPlans(
    project.id
  );
  const projectDetails = await getProjectDetails(project.id);
  const projectBuildingsData = await getProjectBuildingsData(project.id);
  let currentTranslation;

  if (translations?.length > 0) {
    currentTranslation =
      translations?.find(t => t.language === params.locale) || translations[0];
  } else {
    currentTranslation = undefined;
  }

  if (!developer) {
    console.error(`Developer not found for project ID: ${project.id}`);
    return <div>Developer information is unavailable.</div>;
  }

  // 1. Вычисление диапазона цен (базовые данные)
  let priceRangeData: {
    minPrice: number;
    maxPrice: number;
    currencyCode: string;
  } | null = null;
  if (project?.units?.length) {
    const prices = project.units
      .filter(unit => unit.price)
      .map(unit => unit.price as number);

    if (prices.length) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      // Временно используем as any из-за сложностей с выводом типа currency
      const currencyObj = project.currency as any;
      const currencyCode =
        currencyObj?.code ||
        (typeof currencyObj === "string" ? currencyObj : "THB");

      priceRangeData = { minPrice, maxPrice, currencyCode };
    }
  }

  // 2. Обработка специальных предложений
  let processedSpecialOffers: Array<{
    id: string;
    title: string;
    description: string;
    validUntil: string | null;
    icon: string;
  }> = [];
  if (project?.specialOffers) {
    const offers =
      typeof project.specialOffers === "string"
        ? JSON.parse(project.specialOffers)
        : project.specialOffers;

    if (Array.isArray(offers)) {
      processedSpecialOffers = offers
        .map(offer => {
          // Находим нужный перевод или берем первый доступный, если для текущего locale нет
          const translation =
            offer.translations?.[params.locale] ||
            Object.values(offer.translations || {})[0];
          if (translation?.title && translation?.description) {
            return {
              id: offer.id,
              title: translation.title,
              description: translation.description,
              validUntil: translation.validUntil || null, // Обрабатываем возможное отсутствие
              icon: offer.icon || "percentage"
            };
          }
          return null; // Возвращаем null, если нет подходящего перевода
        })
        .filter(offer => offer !== null) as Array<{
        id: string;
        title: string;
        description: string;
        validUntil: string | null;
        icon: string;
      }>; // Фильтруем null значения
    }
  }

  // Prepare developer data matching the expected prop type
  const developerPropData = {
    ...developer,
    // Ensure top-level 'name' exists, derived from translations
    name:
      developer.translations?.find(t => t.language === params.locale)?.name ||
      developer.translations?.[0]?.name ||
      "Unknown Developer",
    // Ensure other required fields from ProjectDeveloper type are present or provide defaults
    id: developer.id
    // rating: developer.rating || 0, // Add if needed by component
    // completedProjects: developer.completedProjects || 0, // Add if needed
    // logo: developer.logo || undefined, // Add if needed
    // establishedYear: developer.establishedYear || undefined, // Add if needed
    // deliveryRate: developer.deliveryRate || undefined, // Add if needed
    // ongoingProjects: developer.ongoingProjects || undefined, // Add if needed
  };

  // Prepare project data matching the expected prop type DomainProject
  // Assuming DomainProject might require a top-level 'translations' array
  const projectPropData = {
    ...project,
    // Add potentially missing fields required by DomainProject type
    // For example, if DomainProject expects 'translations'
    translations: translations || [] // Add the fetched translations if needed by the type
  };

  return (
    <main className="mt-4">
      <ProjectPagePublic
        project={projectPropData as any}
        developer={developerPropData as any}
        amenities={amenities}
        masterPlanPoints={masterPlanPoints}
        buildingsWithFloorPlans={buildingsWithFloorPlans}
        projectDetails={projectDetails}
        projectBuildingsData={projectBuildingsData}
        currentTranslation={currentTranslation}
        locale={params.locale}
        slug={params.slug}
        priceRangeData={priceRangeData}
        specialOffers={processedSpecialOffers}
        projectSlider={"hide"}
      />
    </main>
  );
}
