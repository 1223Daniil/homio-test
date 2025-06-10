import { Card, CardBody } from "@heroui/react";

import { DomainProject } from "@/types/domain";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import InfrastructureMapComponent from "@/components/infrastructure/InfrastructureMap";
import { useTranslations } from "next-intl";

/**
 * Функция для трансформации данных о проекте для компонента оценки локации
 */
export function transformProjectAssessment(project: any) {
  return {
    publicTransport: project.publicTransport || undefined,
    amenitiesLevel: project.amenitiesLevel || undefined,
    climateConditions: project.climateConditions || undefined,
    beachAccess: project.beachAccess || undefined,
    rentalDemand: project.rentalDemand || undefined,
    safetyLevel: project.safetyLevel || undefined,
    noiseLevel: project.noiseLevel || undefined,
    schoolsAvailable: project.schoolsAvailable || undefined
  };
}

interface IProps {
  project: DomainProject;
}

const InfrastructureMap = ({ project }: IProps) => {
  const t = useTranslations("ProjectDetails");

  return (
    <>
      {project?.location?.latitude && project?.location?.longitude ? (
        <ErrorBoundary
          fallback={
            <Card className="w-full">
              <CardBody className="p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
                  {t("infrastructure.title")}
                </h3>
                <p className="text-default-600">
                  Произошла ошибка при загрузке карты. Пожалуйста, попробуйте
                  позже.
                </p>
              </CardBody>
            </Card>
          }
        >
          <InfrastructureMapComponent
            assessment={transformProjectAssessment(project)}
            latitude={project?.location?.latitude}
            longitude={project?.location?.longitude}
            address={
              project?.location
                ? `${project.location.district || ""}, ${project.location.city || ""}`
                : ""
            }
          />
        </ErrorBoundary>
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
    </>
  );
};

export default InfrastructureMap;
