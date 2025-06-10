"use client";

import { Link } from "@heroui/react";
import { IconArrowRight } from "@tabler/icons-react";
import { ProjectMedia } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { useTranslations, useLocale } from "next-intl";

type ProjectWithRelations = NonNullable<
  Prisma.UnitGetPayload<{
    include: {
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
  }>["project"]
>;

interface Props {
  project: ProjectWithRelations | null;
}

export function ProjectCardForPage({ project }: Props) {
  const t = useTranslations("ProjectDetails");
  const locale = useLocale();

  const formatDate = (date: Date | string | null) => {
    if (!date) return t("projectCard.undefined");
    
    try {
      const formatted = new Date(date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        month: 'short',
        year: 'numeric'
      });
      
      // Делаем первую букву заглавной
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (error) {
      console.error('Date formatting error:', error);
      return t("projectCard.undefined");
    }
  };

  return (
    <div
      className={`grid md:flex gap-8 bg-white dark:bg-[#2C2C2C] rounded-xl p-4 md:p-6 shadow-small`}
    >
      {/* Project Image */}
      <div className="w-full md:w-2/5">
        <img
          src={
            project?.media?.find(m => m.category === "BANNER")?.url ||
            "/placeholder.jpg"
          }
          alt={project?.name || "Project image"}
          className="w-full h-[200px] md:h-full object-cover rounded-lg"
        />
      </div>

      {/* Project Details List */}
      <div className="w-full md:w-3/5">
        <div className="divide-y divide-default-200">
          {/* Location */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
            <p className="text-sm text-default-500 md:text-base">{t("projectCard.location")}</p>
            {project?.location ? (
              <div className="flex items-center gap-2">
                <Link
                  href="#"
                  className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm md:text-base"
                >
                  {`${project.location.district}, ${project.location.city}`}
                  <IconArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <p className="text-sm md:text-base">{t("projectCard.undefined")}</p>
            )}
          </div>

          {/* Project name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
            <p className="text-sm text-default-500 md:text-base">{t("projectCard.projectName")}</p>
            {project?.name ? (
              <Link
                href={`/projects/${project.id}`}
                className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm md:text-base"
              >
                {project.name}
                <IconArrowRight size={16} />
              </Link>
            ) : (
              <p className="text-sm md:text-base">{t("projectCard.undefined")}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
            <p className="text-sm text-default-500 md:text-base">{t("projectCard.status")}</p>
            <p className="text-sm md:text-base">
              {project?.status ? t(`projectCard.values.status.${project.status}`) : t("projectCard.undefined")}
            </p>
          </div>

          {/* Completion date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
            <p className="text-sm text-default-500 md:text-base">{t("projectCard.completionDate")}</p>
            <p className="text-sm md:text-base">
              {project?.completionDate ? formatDate(project.completionDate) : t("projectCard.undefined")}
            </p>
          </div>

          {/* Type */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
            <p className="text-sm text-default-500 md:text-base">{t("projectCard.type")}</p>
            <p className="text-sm md:text-base">
              {project?.type ? (
                t(`projectCard.values.type.${project.type}`, { fallback: project.type })
              ) : t("projectCard.undefined")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
