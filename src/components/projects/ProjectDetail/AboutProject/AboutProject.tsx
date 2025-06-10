import {
  DomainProject,
  ProjectDeveloper,
  ProjectTranslation
} from "@/types/domain";

import Description from "./Description";
import { IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import { Link } from "@/config/i18n";
import { TbLocation } from "react-icons/tb";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { useTranslations } from "next-intl";

interface IProps {
  currentTranslation: ProjectTranslation;
  project: DomainProject;
  developer: ProjectDeveloper;
  priceRange: string;
}

const AboutProject = ({
  currentTranslation,
  project,
  developer,
  priceRange
}: IProps) => {
  const t = useTranslations("ProjectDetails");

  console.log("currentTranslation", currentTranslation);

  return (
    <div className="mb-8 sm:mb-0">
      <h2 className="text-xl sm:text-2xl font-bold lg:mb-4 text-default-900 break-words">
        {currentTranslation?.name || "Project"}
      </h2>

      <p className="text-[30px] leading-[38px] font-semibold md:hidden">
        {priceRange}
      </p>

      <div className="flex gap-6 md:hidden mt-4">
        <div>
          <p className="text-gray-500 text-sm leading-5">
            {t("projectInfo.offDate")}
          </p>
          <p className={"text-gray-900 text-xl leading-[28px] font-semibold"}>
            {formatDateToQuarter(project?.completionDate || "")}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm leading-5">
            {t("projectInfo.buildings")}
          </p>
          <p className={"text-gray-900 text-xl leading-[28px] font-semibold"}>
            {project?.buildings?.length || t("projectInfo.values.notSpecified")}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm leading-5">
            {t("projectInfo.units")}
          </p>
          <p className={"text-gray-900 text-xl leading-[28px] font-semibold"}>
            {project?.totalUnits || t("projectInfo.values.notSpecified")}
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-2 mt-4 md:hidden">
        <div className="flex gap-2 justify-between">
          <div className="flex flex-wrap flex-col gap-4">
            <div className="flex items-center gap-2">
              <IconMapPin size={20} className="text-gray-400 drop-shadow-sm" />
              <span className="text-gray-400 drop-shadow-sm">
                {project.location
                  ? `${project.location.district}, ${project.location.city}, ${project.location.country}`
                  : t("location.unknown")}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <TbLocation size={20} className="text-gray-400 drop-shadow-sm" />
              <span className="text-gray-400 drop-shadow-sm">
                {t("beachDistance", {
                  distance: project.location?.beachDistance
                })}
              </span>
            </div>
          </div>

          <div
            className={`min-w-[64px] max-h-[64px] rounded-lg relative overflow-clip;`}
          >
            <Image src="/images/location-icon.png" fill alt="Map" />
          </div>
        </div>
      </div>

      <Description currentTranslation={currentTranslation} />

      <div className="mt-3 md:hidden">
        <div className="flex justify-between gap-3 text-gray-500">
          <span className="text-sm leading-5">Developer</span>
          <span className="text-[#3062B8] text-sm leading-5 font-semibold">
            <Link href={`/developers/${project.developerId}`}>
              {developer?.name}
            </Link>
          </span>
        </div>

        <div className="flex justify-between gap-3 text-gray-500">
          <span className="text-sm leading-5">
            {/* {t("projectInfo.constructionPhase")} */}
          </span>
          <span className="text-[#3062B8] text-sm leading-5 font-semibold">
            <Link href={`/developers/${project.developerId}`}>
              {developer?.phase}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AboutProject;
