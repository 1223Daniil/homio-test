"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Image,
  Button,
  Chip,
  Divider
} from "@heroui/react";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";
import { DomainProject } from "@/types/domain";
import { getMediaUrl } from "@/lib/utils";
import { IconEdit } from "@tabler/icons-react";
import { ProjectStatus } from "@prisma/client";

interface ProjectCardProps {
  project: DomainProject;
  onEditClick: () => void;
}

export default function ProjectCard({ project, onEditClick }: ProjectCardProps) {
  const t = useTranslations("projects");
  const router = useRouter();

  const getStatusColor = (status: ProjectStatus): "success" | "warning" | "default" | "primary" | "secondary" | "danger" => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return "success";
      case ProjectStatus.COMPLETED:
        return "success";
      case ProjectStatus.CONSTRUCTION:
        return "warning";
      case ProjectStatus.PLANNING:
        return "primary";
      case ProjectStatus.DRAFT:
        return "default";
      case ProjectStatus.INACTIVE:
        return "danger";
      default:
        return "default";
    }
  };

  const formatPrice = (price: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const mainImage = project.media?.[0];
  const mainTranslation = project.translations?.[0];

  return (
    <Card className="w-full">
      {mainImage && (
        <CardHeader className="p-0">
          <div className="relative w-full">
            <Image
              src={getMediaUrl(mainImage.url)}
              alt={mainImage.title ?? project.name ?? t("untitled")}
              className="object-cover aspect-video w-full"
              radius="none"
            />
          </div>
        </CardHeader>
      )}
      <CardBody className="gap-2 p-5">
        <div className="flex flex-col gap-2">
          <p className="font-bold">
            {project.name || t("untitled")}
          </p>
          <Chip
            color={getStatusColor(project.status)}
            variant="flat"
            size="sm"
            className="w-fit"
          >
            {t(`status.${project.status.toLowerCase()}`)}
          </Chip>
          {project.location && (
            <p className="text-sm text-gray-500">
              {project.location.city}, {project.location.country}
            </p>
          )}
          {mainTranslation?.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {mainTranslation.description}
            </p>
          )}
          <Divider className="my-2" />
          <div className="flex justify-between items-center">
            {project.totalLandArea && (
              <p className="text-sm text-gray-500">
                {project.totalLandArea} m²
              </p>
            )}
            {project.pricing?.currency && (
              <p className="text-lg font-semibold">
                {formatPrice(project.pricing.basePrice, project.pricing.currency.code)}
              </p>
            )}
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={onEditClick}
            className="flex items-center gap-2"
          >
            <IconEdit size={16} />
            {t("actions.edit")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
