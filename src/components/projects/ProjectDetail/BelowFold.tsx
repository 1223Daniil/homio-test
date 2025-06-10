import { Card, CardBody } from "@heroui/react";
import { DocumentCategory, MediaCategory } from "@prisma/client";
import { IconArrowRight, IconFileText } from "@tabler/icons-react";

import AmenitiesAdaptiveSlider from "@/shared/components/AmenitiesAdaptiveSlider";
import Image from "next/image";
import { Link } from "@/config/i18n";
import ProjectAdaptiveSpecialOffers from "@/shared/components/ProjectAdaptiveSpecialOffers";
import dynamic from "next/dynamic";

// Динамический импорт компонентов
const ComplexAmenitiesComponent = dynamic(() =>
  import("@/components/amenities/ComplexAmenities").then(mod => ({
    default: mod.ComplexAmenities
  }))
);

const ConstructionProgressSliderComponent = dynamic(
  () => import("./AboutProject/ConstructionProgressSlider")
);

const InfrastructureMapComponent = dynamic(
  () => import("@/components/infrastructure/InfrastructureMap")
);

const MasterPlanComponent = dynamic(() => import("./AboutProject/MasterPlan"));

const SpecialOffersComponent = dynamic(() =>
  import("@/components/projects/SpecialOffers").then(mod => mod.SpecialOffers)
);

const ViewingRequestComponent = dynamic(() =>
  import("@/components/projects/ViewingRequest").then(mod => mod.ViewingRequest)
);

// Фолбэк-компонент используется только для динамических импортов
const LoadingSkeleton = ({ height = "12rem" }: { height?: string }) => (
  <div
    className="bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
    style={{ height }}
  />
);

interface BelowFoldProps {
  project: any;
  developer: any;
  currentTranslation: any;
  amenities: any[];
  masterPlanPoints: any[];
  projectBuildingsData: any[];
  locale: string;
  specialOffers: any[];
  generalDocuments: any[];
  amenitiesMedia: any[];
  priceRange: string;
  formatDate: (date: string | Date | null | undefined) => string;
  formatProjectsText: (count: number, locale: string) => string;
  t: any;
  developerT: any;
}

export default function BelowFold({
  project,
  developer,
  currentTranslation,
  amenities,
  masterPlanPoints,
  projectBuildingsData,
  locale,
  specialOffers,
  generalDocuments,
  amenitiesMedia,
  priceRange,
  formatDate,
  formatProjectsText,
  t,
  developerT
}: BelowFoldProps) {
  return (
    <>
      {/* Специальные предложения */}
      {specialOffers.length > 0 && (
        <>
          <div className="mb-8 sm:mb-0 hidden lg:block">
            <SpecialOffersComponent offers={specialOffers} />
          </div>
          <ProjectAdaptiveSpecialOffers offers={specialOffers} />
        </>
      )}

      <div className="mt-4 sm:mt-3">
        <MasterPlanComponent
          project={project}
          masterPlanPoints={masterPlanPoints}
          projectBuildingsData={projectBuildingsData || []}
          isClient={true}
          locale={locale as string}
        />
      </div>

      <ComplexAmenitiesComponent
        amenities={amenities || []}
        title={t("amenities.title")}
      />

      <div className="md:hidden">
        {amenitiesMedia.length > 0 && (
          <AmenitiesAdaptiveSlider
            medias={amenitiesMedia.map(media => ({
              media: {
                id: media.id || "",
                projectId: media.projectId || "",
                url: media.url,
                type: media.type,
                category: media.category as MediaCategory,
                title: media.title || null,
                description: media.description || null,
                order: media.order || 0,
                createdAt: media.createdAt || new Date(),
                updatedAt: media.updatedAt || new Date(),
                metadata: (media as any).metadata || null,
                thumbnailUrl: (media as any).thumbnailUrl || media.url,
                isCover: (media as any).isCover || false,
                isMainVideo: (media as any).isMainVideo || false,
                blurhash: (media as any).blurhash || null
              },
              description: media.description || ""
            }))}
          />
        )}
      </div>

      {/* Информация о застройщике */}
      <div className="mt-12 hidden lg:block">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
          {t("aboutDeveloper")}
        </h2>
        <Card className="w-full bg-white dark:bg-[#2C2C2C] shadow-small overflow-hidden">
          <CardBody className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 relative">
                  <Image
                    src={developer?.logo || "/vip-logo.png"}
                    alt={developer?.translations?.[0]?.name || "Developer"}
                    fill
                    className="object-cover"
                    sizes="48px"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl font-semibold">
                  {developer?.translations?.[0]?.name || "UNKNOWN"}
                </h3>
              </div>
              <Link
                href={`/developers/${developer?.id}`}
                className="text-primary hover:text-primary/80 flex items-center gap-1 break-words max-w-[200px]"
              >
                <span className="truncate">{t("developer.learnMore")}</span>
                <IconArrowRight size={18} className="flex-shrink-0" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-full">
              <div className="max-w-full">
                <div className="text-sm text-gray-500 mb-1 break-words">
                  {developerT("deliveredOnTime")}
                </div>
                <div className="text-lg font-semibold flex items-center gap-2 break-words">
                  {developer?.deliveryRate || "0"}%
                </div>
              </div>

              <div className="max-w-full">
                <div className="text-sm text-gray-500 mb-1 break-words">
                  {developerT("yearOfEstablishment")}
                </div>
                <div className="text-lg font-semibold break-words">
                  {developer?.establishedYear || developerT("unnamed")}
                </div>
              </div>

              <div className="max-w-full">
                <div className="text-sm text-gray-500 mb-1 break-words">
                  {developerT("completed")}
                </div>
                <div className="text-lg font-semibold break-words">
                  {developer?.completedProjects || "0"}{" "}
                  {formatProjectsText(
                    Number(developer?.completedProjects) || 0,
                    locale as string
                  )}
                </div>
              </div>

              <div className="max-w-full">
                <div className="text-sm text-gray-500 mb-1 break-words">
                  {developerT("underConstruction")}
                </div>
                <div className="text-lg font-semibold break-words">
                  {developer?.ongoingProjects || "0"}{" "}
                  {formatProjectsText(
                    Number(developer?.ongoingProjects) || 0,
                    locale as string
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-12">
        {project?.location?.latitude && project?.location?.longitude ? (
          <InfrastructureMapComponent
            latitude={project?.location?.latitude}
            longitude={project?.location?.longitude}
            address={project?.location?.address}
            beachDistance={project?.location?.beachDistance}
            assessment={{
              publicTransport: project?.publicTransport || 0,
              amenitiesLevel: project?.amenitiesLevel || 0,
              climateConditions: project?.climateConditions || 0,
              beachAccess: project?.beachAccess || 0,
              rentalDemand: project?.rentalDemand || 0,
              safetyLevel: project?.safetyLevel || 0,
              noiseLevel: project?.noiseLevel || 0,
              schoolsAvailable: project?.schoolsAvailable || 0
            }}
          />
        ) : (
          <Card className="w-full">
            <CardBody className="p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
                {t("infrastructure.title")}
              </h3>
              <p className="text-default-600">
                {t("infrastructure.noLocationData")}
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Last updates */}
      <ConstructionProgressSliderComponent project={project} />

      {/* Licenses & certifications */}
      {generalDocuments.length > 0 && (
        <>
          <div className="mt-12">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
              {t("projectInfo.columns.licenses")}
            </h3>
            <div className="space-y-4">
              {generalDocuments.map(document => (
                <Card
                  key={document.id}
                  className="w-full bg-white dark:bg-[#2C2C2C] shadow-small"
                >
                  <CardBody className="p-4">
                    <div className="flex items-start gap-[14px]">
                      <div className="bg-[#EBF2FF] border-[4px] size-8 border-[#F5F8FF] rounded-full flex items-center justify-center">
                        <IconFileText className="size-4 text-[#416DC6]" />
                      </div>

                      <div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-default-900 text-[18px] leading-[22px] hidden md:block">
                            {document.title}
                          </h4>

                          <h4 className="font-semibold text-default-900 text-[18px] leading-[22px] md:hidden">
                            {document.title.length > 25
                              ? document.title.slice(0, 22) + "..."
                              : document.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {t("documents.date")}:{" "}
                            {formatDate(document.createdAt)}
                          </p>
                        </div>

                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#535862] hover:text-[#416DC6] flex items-center gap-2 mt-2"
                        >
                          <span className="text-sm">
                            {locale === "ru"
                              ? "Просмотр документа"
                              : "Show document"}
                          </span>
                          <IconArrowRight
                            size={16}
                            className="flex-shrink-0 text-[#535862]"
                          />
                        </a>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}

              {/* Показываем сообщение, если нет документов */}
              {generalDocuments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t("projectInfo.columns.noLicenses")}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
