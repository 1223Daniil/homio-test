"use client";

import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { FloorPlan, Prisma, UserRole } from "@prisma/client";
import {
  IconBabyCarriage,
  IconBarbell,
  IconBuildingStore,
  IconEdit,
  IconPaw,
  IconSwimming,
  IconWifi
} from "@tabler/icons-react";
import { Link, useRouter } from "@/config/i18n";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import AboutUnit from "@/widgets/AboutUnit";
import { Alert } from "@mantine/core";
import { ComplexAmenities } from "@/components/amenities/ComplexAmenities";
import DeveloperMiniCard from "@/widgets/DeveloperMiniCard";
import InfrastructureMap from "@/components/infrastructure/InfrastructureMap";
import MediaFilters from "@/shared/components/MediaFilters";
import MediaGalleyModal from "@/widgets/modals/MediaGalleyModal";
import MediaSliderPublic from "@/widgets/MediaSlider/MediaSliderPublic";
import { Button as NextButton } from "@heroui/react";
import PersonalBroker from "@/widgets/PersonalBroker";
import ProjectAdaptiveSlider from "@/shared/components/ProjectAdaptiveSlider/ProjectAdaptiveSlider";
import { ProjectWithRelations } from "@/types/project";
import RequestView from "@/widgets/RequestView";
import SimilarProjectsPublic from "@/widgets/SimilarProjects/SimilarProjectsPublic";
import SimilarUnitsPublic from "@/widgets/SimilarUnits/SimilarUnitsPublic";
import UnitAboutBuilding from "@/widgets/UnitAboutBuilding";
import UnitPurchaseConditions from "@/widgets/UnitPurchaseConditions";
import UnitQuickActions from "@/widgets/UnitQuickActions";
import UnitYieldCalculator from "@/widgets/UnitYieldCalculator";
import { ViewingRequestModal } from "@/components/projects/ViewingRequestModal";
import { transformProjectAssessment } from "@/components/projects/ProjectDetail/ProjectDetail";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type UnitWithRelations = Prisma.UnitGetPayload<{
  include: {
    media: true;
    building: {
      include: {
        media: true;
      };
    };
    project: {
      include: {
        media: true;
        location: true;
        amenities: {
          include: {
            amenity: true;
          };
        };
        yield: {
          select: {
            expected: true;
            guaranteed: true;
            potential: true;
          };
        };
      };
    };
  };
}>;

// Unified interface for media items
interface MediaItem {
  url: string;
  title?: string | null;
  category?: string;
  floorPlan?: string;
  [key: string]: any; // Allow any additional properties
}

export default function UnitDetailPublicContent({
  unit,
  project,
  building,
  similarProjects,
  similarUnits,
  amenities,
  developer,
  layout
}: {
  unit: UnitWithRelations;
  project: ProjectWithRelations;
  building: any;
  similarProjects: ProjectWithRelations[];
  similarUnits: UnitWithRelations[];
  amenities: any;
  developer: any;
  layout: any;
}) {
  const t = useTranslations("ProjectDetails");
  const tUnit = useTranslations("UnitDetail");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string; unitSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutImages, setLayoutImages] = useState<MediaItem[]>([]);
  const [translation, setTranslation] = useState<any>();
  const [tags, setTags] = useState<string[]>([]);
  const [unitFacts, setUnitFacts] = useState<string[]>([]);
  const [miniDeveloperCardData, setMiniDeveloperCardData] = useState<any>(null);
  const [mediaGalleryImages, setMediaGalleryImages] = useState<any[]>([]);
  const [mediaFilter, setMediaFilter] = useState<{
    isOpen: boolean;
    view: "Gallery" | "Layout" | "3d" | null;
  }>({
    isOpen: false,
    view: null
  });
  const [isViewingRequestOpen, setIsViewingRequestOpen] = useState(false);
  const [floorPlans, setFloorPlans] = useState<{
    currentUnitId: string;
    floorPlans: FloorPlan[];
    layoutImage: string | null;
  }>({
    currentUnitId: params?.unitSlug || "",
    floorPlans: [],
    layoutImage: null
  });

  console.log("layout", layout);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!params || !params.unitSlug) {
          throw new Error("Missing required parameters");
        }

        if (!unit) {
          throw new Error("Failed to fetch unit");
        }
        if (!project) throw new Error("Failed to fetch project");

        if (building?.id) {
          if (building.floorPlans) {
            setFloorPlans(prev => ({
              ...prev,
              floorPlans: building.floorPlans
            }));
          }
        }

        try {
          // Проверяем, что layoutId не null перед вызовом getLayoutById
          if (unit.layoutId) {
            if (layout?.mainImage) {
              setLayoutImages([{ url: layout.mainImage, title: null }]);
            }

            // Безопасное добавление дополнительных изображений
            if (layout?.images && Array.isArray(layout.images)) {
              setLayoutImages(prev => {
                // Проверка типа элементов массива
                const additionalImages = layout.images
                  .map(img => {
                    // Если img это строка, создаем объект
                    if (typeof img === "string") {
                      return { url: img, title: null };
                    }
                    // Если img уже объект с полем url
                    else if (img && typeof img === "object" && "url" in img) {
                      return { url: img.url, title: img.title || null };
                    }
                    // Защита от некорректных данных
                    return null;
                  })
                  .filter(Boolean) as MediaItem[];

                return [...prev, ...additionalImages];
              });
            }
          }
        } catch (layoutError) {
          console.error("Error fetching layout:", layoutError);
        }

        // Подготавливаем данные для карточки
        const miniDeveloperCardData = {
          project: {
            name: project.translations[0].name || tUnit("no-data"),
            link: `/projects/${unit.project.id}`,
            location: {
              address: `${project.location?.city || tUnit("no-data")}, ${project.location?.district || tUnit("no-data")}`,
              beach: project.location?.beachDistance
                ? tUnit("developer-widget.beach", {
                    distance: project.location.beachDistance
                  })
                : tUnit("developer-widget.beachDistanceNotSpecified"),
              distance: project.location?.centerDistance
                ? `${project.location.centerDistance}`
                : tUnit("no-data")
            }
          },
          developer: developer
            ? {
                name:
                  developer.translations.find(
                    translation => translation.language === locale
                  )?.name ||
                  developer.translations[0]?.name ||
                  tUnit("no-data"),
                link: `/developers/${developer.id || ""}`,
                image: developer.logo || "/images/default-developer.png"
              }
            : {
                name: tUnit("no-data"),
                link: "#",
                image: "/images/default-developer.png"
              }
        };

        console.log("miniDeveloperCardData", miniDeveloperCardData);
        console.log("developer", developer);

        setMiniDeveloperCardData(miniDeveloperCardData);

        // Устанавливаем факты о юните
        const facts = {
          bedrooms: unit.layout?.bedrooms || unit.bedrooms,
          bathrooms: unit.layout?.bathrooms || unit.bathrooms,
          area: unit.layout?.totalArea
            ? `${unit.layout.totalArea} ${tUnit("developer-widget.sqm")}`
            : unit.area
              ? `${unit.area} ${tUnit("developer-widget.sqm")}`
              : tUnit("no-data"),
          floor: unit.floor
            ? `${unit.floor}/${building.floors}`
            : tUnit("no-data"),
          completion: project.completionDate
            ? new Date(project.completionDate).toLocaleDateString()
            : tUnit("no-data")
        };

        setUnitFacts(facts);

        if (unit.layout && unit.layout.mainImage) {
          setFloorPlans(prev => ({
            ...prev,
            layoutImage: unit.layout.mainImage
          }));
        }

        setTranslation(unit.translations.find(t => t.language === locale));
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale, params?.unitSlug, project, unit, building, tUnit]);

  useEffect(() => {
    if (mediaFilter) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [mediaFilter]);

  useEffect(() => {
    if (unit) {
      const mediaGalleryImages = [
        ...(unit.media || []).map(media => ({
          url: media.url,
          type: "image",
          category: media.category,
          interior: true
        })),
        ...(project?.media || []).map(media => ({
          url: media.url,
          type: "image",
          category: media.category,
          interior: false
        }))
      ];

      setMediaGalleryImages(mediaGalleryImages);
    }
  }, [unit, project]);

  if (error)
    return (
      <div className="max-w-[1200px] mx-auto px-8">
        <Alert color="danger">{error}</Alert>
      </div>
    );

  if (!unit)
    return (
      <div className="max-w-[1448px] mx-auto px-8">
        <Alert color="secondary">{t("unit.notFound")}</Alert>
      </div>
    );

  console.log("project-building", project, building);

  return (
    <div className="max-w-[1448px] mx-auto px-8 py-8 mt-[6rem]">
      <MediaGalleyModal
        isOpen={mediaFilter}
        setIsOpen={setMediaFilter}
        images={mediaGalleryImages || []}
        floorPlans={floorPlans}
      />

      <ViewingRequestModal
        isOpen={isViewingRequestOpen}
        onClose={() => setIsViewingRequestOpen(false)}
        projectId={params?.slug || ""}
        projectName={
          project?.translations?.[0]?.name ||
          unit?.project?.translations?.[0]?.name ||
          ""
        }
      />

      {/* Edit button */}
      <div className="mb-6 flex justify-between">
        <div className="hidden md:block">
          <Breadcrumbs>
            <BreadcrumbItem>
              <Link href="/search">{t("breadcrumbs.catalogue")}</Link>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Link href={`/p/${params.slug}`}>
                {project?.translations?.[0]?.name || ""}
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Link href={`/p/${params.slug}/units/${params.unitSlug}`}>
                {unit.layout && unit.layout.type && unit.layout.type === "VILLA"
                  ? tUnit("request-viewing.unit-title-villa", {
                      bed: unit.layout?.bedrooms || unit.bedrooms,
                      area: unit.layout?.totalArea || unit.area
                    })
                  : tUnit("request-viewing.unit-title", {
                      bed: unit.layout?.bedrooms || unit.bedrooms,
                      area: unit.layout?.totalArea || unit.area,
                      floor: unit.floor,
                      floors: unit.building.floors
                    })}
              </Link>
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-9 w-full">
          {/* Слайдер */}
          {mediaGalleryImages.length > 0 && (
            <>
              <MediaSliderPublic media={mediaGalleryImages} />
              <ProjectAdaptiveSlider media={mediaGalleryImages} />
            </>
          )}

          {mediaGalleryImages.length > 0 && (
            <MediaFilters setIsOpen={setMediaFilter} className="mt-12" />
          )}

          <AboutUnit
            price={unit.price}
            currency={unit.project?.currency}
            description={unit.description || layout?.description || ""}
            facilities={unit.layout}
            factsList={unitFacts}
            underHeaderContent={
              !mediaGalleryImages.length && (
                <MediaFilters setIsOpen={setMediaFilter} className="mt-12" />
              )
            }
            project={{
              name: project.translations[0].name || tUnit("no-data"),
              location: {
                address: `${project.location?.city || tUnit("no-data")}, ${project.location?.district || tUnit("no-data")}`,
                beach: project.location?.beachDistance
                  ? tUnit("developer-widget.beach", {
                      distance: project.location.beachDistance
                    })
                  : tUnit("developer-widget.beachDistanceNotSpecified"),
                distance: project.location?.centerDistance
                  ? `${project.location.centerDistance}`
                  : tUnit("no-data")
              }
            }}
            developerName={developer?.translations?.[0]?.name || ""}
            onRequestView={() => setIsViewingRequestOpen(true)}
          />

          <UnitYieldCalculator
            unitPrice={unit.price || undefined}
            currency={unit.project?.currency || undefined}
          />

          <UnitPurchaseConditions unit={unit} />

          {/* Infrastructure */}
          <div id="infrastructure" className="mt-12">
            <InfrastructureMap
              assessment={transformProjectAssessment(project)}
              latitude={unit.project?.location?.latitude || 7.8}
              longitude={unit.project?.location?.longitude || 98.3}
              address={
                unit.project?.location
                  ? `${unit.project.location.district || ""}, ${unit.project.location.city || ""}`
                  : ""
              }
            />
          </div>

          <SimilarUnitsPublic units={similarUnits} />

          <UnitAboutBuilding
            aboutBuilding={{
              project: project,
              building: building
            }}
          />

          {/* Complex amenities */}
          <ComplexAmenities
            amenities={amenities || []}
            title="Complex amenities"
            maxVisible={6}
          />

          <SimilarProjectsPublic similarProjects={similarProjects} />

          {/* {tags.length > 0 && <Tags tags={tags} />} */}
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-4 max-w-[320px] hidden md:block">
          <RequestView
            unit={{
              title:
                unit.layout && unit.layout.type && unit.layout.type === "VILLA"
                  ? tUnit("request-viewing.unit-title-villa", {
                      bed: unit.layout?.bedrooms || unit.bedrooms,
                      area: unit.layout?.totalArea || unit.area
                    })
                  : tUnit("request-viewing.unit-title", {
                      bed: unit.layout?.bedrooms || unit.bedrooms,
                      area: unit.layout?.totalArea || unit.area,
                      floor: unit.floor,
                      floors: unit.building.floors
                    }),
              area: unit.layout?.totalArea || unit.area,
              bedrooms: unit.layout?.bedrooms || unit.bedrooms,
              floor: unit.floor,
              price: unit.price,
              currency: unit.project?.currency
            }}
            onRequestView={() => setIsViewingRequestOpen(true)}
            onRequestDetails={() => setIsViewingRequestOpen(true)}
          />

          <UnitQuickActions />

          <DeveloperMiniCard data={miniDeveloperCardData} />

          <PersonalBroker />
        </div>
      </div>
    </div>
  );
}
