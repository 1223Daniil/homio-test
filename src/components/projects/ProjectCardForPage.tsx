import { Badge, Card, Group, Text, Tooltip } from "@mantine/core";
import {
  Amenity,
  Developer,
  DeveloperTranslation,
  Location,
  Project,
  ProjectAmenity,
  ProjectMedia,
  ProjectTranslation
} from "@prisma/client";
import { Building2, MapPin, Timer } from "lucide-react";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ProjectWithRelations extends Project {
  translations: ProjectTranslation[];
  location: Location | null;
  media: ProjectMedia[];
  developer: Developer & {
    translations: DeveloperTranslation[];
  };
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
}

interface ProjectCardForPageProps {
  project: ProjectWithRelations;
}

export function ProjectCardForPage({ project }: ProjectCardForPageProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();

  console.log("project", project);

  const mainImage = project.media?.[0]?.url || '/placeholder-logo.png';
  const translation =
    project.translations?.find(t => t.language === locale) ||
    project.translations?.[0];
  const location = project.location;
  const developerTranslation =
    project.developer?.translations?.find(t => t.language === locale) ||
    project.developer?.translations?.[0];

  console.log("project", project);

  const formatPrice = (value: number): string => {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    }
    return `฿${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Link href={`/${locale}/projects/${project.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          className="h-full transition-all duration-300 hover:shadow-lg"
        >
          <Card.Section>
            <div className="relative aspect-video">
              <Image
                src={mainImage}
                alt={translation?.name || t("untitled")}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjhAOEA4Qi4tMkYyLlFUUVRBRkFGWkZaUVRUUVT/2wBDAR"
                priority
              />
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Badge
                  variant="filled"
                  color={project.status === "ACTIVE" ? "green" : "gray"}
                >
                  {t(`status.${project.status.toLowerCase()}`)}
                </Badge>
                {project.type && (
                  <Badge variant="filled" color="blue">
                    {t(`type.${project.type.toLowerCase()}`)}
                  </Badge>
                )}
              </div>
            </div>
          </Card.Section>

          <div className="p-4">
            <Group position="apart" mb="xs">
              <Text weight={500} size="lg" className="line-clamp-1">
                {translation?.name || t("untitled")}
              </Text>
              {project.constructionStatus !== null && (
                <Tooltip label={t("constructionProgress")}>
                  <Badge variant="light" color="green">
                    {`${project.constructionStatus}%`}
                  </Badge>
                </Tooltip>
              )}
            </Group>

            {location && (
              <Group spacing="xs" className="mb-3">
                <MapPin size={16} className="text-gray-500" />
                <Text size="sm" color="dimmed" className="line-clamp-1">
                  {[location.district, location.city, location.country]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </Group>
            )}

            {developerTranslation && (
              <Group spacing="xs" className="mb-3">
                <Building2 size={16} className="text-gray-500" />
                <Text size="sm" color="dimmed" className="line-clamp-1">
                  {developerTranslation.name}
                </Text>
              </Group>
            )}

            <Text size="sm" color="dimmed" className="line-clamp-2 mb-4">
              {translation?.description || t("noDescription")}
            </Text>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {project.totalUnits && (
                <Tooltip label={t("totalUnits")}>
                  <Group spacing="xs">
                    <Building2 size={16} className="text-gray-500" />
                    <Text size="sm">
                      {project.totalUnits} {t("units")}
                    </Text>
                  </Group>
                </Tooltip>
              )}

              {project.completionDate && (
                <Tooltip label={t("completionDate")}>
                  <Group spacing="xs">
                    <Timer size={16} className="text-gray-500" />
                    <Text size="sm">
                      {new Date(project.completionDate).getFullYear()}
                    </Text>
                  </Group>
                </Tooltip>
              )}
            </div>

            {project.amenities.length > 0 && (
              <div className="mt-4">
                <Text size="sm" weight={500} className="mb-2">
                  {t("amenities.label")}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.slice(0, 3).map(({ amenity }) => (
                    <Tooltip key={amenity.id} label={amenity.description}>
                      <Badge variant="outline" size="sm">
                        {amenity.name}
                      </Badge>
                    </Tooltip>
                  ))}
                  {project.amenities.length > 3 && (
                    <Tooltip
                      label={project.amenities
                        .slice(3)
                        .map(({ amenity }) => amenity.name)
                        .join(", ")}
                    >
                      <Badge variant="outline" size="sm">
                        +{project.amenities.length - 3}
                      </Badge>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
