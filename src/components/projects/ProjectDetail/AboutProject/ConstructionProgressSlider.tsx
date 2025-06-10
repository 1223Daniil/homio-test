"use client";

import { Card, CardBody } from "@heroui/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { DomainProject } from "@/types/domain";
import Image from "next/image";
import { MediaCategory } from "@prisma/client";
import { useTranslations } from "next-intl";

interface ConstructionProgressSliderProps {
  project: DomainProject;
}

const ConstructionProgressSlider = ({
  project
}: ConstructionProgressSliderProps) => {
  const [currentUpdateSlide, setCurrentUpdateSlide] = useState(0);

  const t = useTranslations("ProjectDetails");

  // Мемоизируем фильтрацию медиа, чтобы избежать повторных вычислений при рендеринге
  const constructionProgressMedia = useMemo(() => {
    return (project?.media || []).filter(
      media => media.category === MediaCategory.CONSTRUCTION_PROGRESS
    );
  }, [project?.media]);

  // Мемоизируем количество слайдов
  const totalSlides = useMemo(() => {
    return Math.ceil(constructionProgressMedia.length / 3);
  }, [constructionProgressMedia.length]);

  // Если нет медиа, возвращаем null
  if (constructionProgressMedia.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
        {t("headers.lastUpdates")}
      </h3>
      <div className="relative">
        <div className="flex overflow-hidden px-1 pb-4">
          {Array.from({ length: totalSlides }, (_, i) => (
            <div
              key={i}
              className={`w-full grid grid-cols-3 gap-4 transition-transform duration-300 ease-in-out ${
                i === currentUpdateSlide ? "opacity-100" : "opacity-0 absolute"
              }`}
              style={{
                transform: `translateX(${(i - currentUpdateSlide) * 100}%)`
              }}
            >
              {constructionProgressMedia
                .slice(i * 3, i * 3 + 3)
                .map((media, index) => (
                  <Card
                    key={index}
                    className="bg-white dark:bg-[#2C2C2C] shadow-small"
                  >
                    <CardBody className="p-0">
                      <div className="h-[180px] overflow-hidden">
                        <Image
                          src={media.url}
                          alt={
                            media.description ||
                            `Construction Update ${index + 1}`
                          }
                          className="w-full h-full object-cover"
                          width={400}
                          height={180}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">
                          {media.description ||
                            (media.createdAt
                              ? new Date(media.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    year: "numeric"
                                  }
                                )
                              : t("projectInfo.values.tba"))}
                        </h3>
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </div>
          ))}
        </div>

        {constructionProgressMedia.length > 3 && (
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="p-2 rounded-full bg-default-100 hover:bg-default-200 disabled:opacity-50"
              onClick={() =>
                setCurrentUpdateSlide(prev => Math.max(0, prev - 1))
              }
              disabled={currentUpdateSlide === 0}
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              className="p-2 rounded-full bg-default-100 hover:bg-default-200 disabled:opacity-50"
              onClick={() =>
                setCurrentUpdateSlide(prev =>
                  Math.min(totalSlides - 1, prev + 1)
                )
              }
              disabled={currentUpdateSlide === totalSlides - 1}
            >
              <IconChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionProgressSlider;
