"use client";

import { Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";

import { IconSchool } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CertificationBlockProps {
  developerId: string;
  locale: string;
}

export function CertificationBlock({
  developerId,
  locale
}: CertificationBlockProps) {
  const t = useTranslations("ProjectDetails");
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const checkCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/developers/${developerId}/courses`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // Тихая обработка ошибки без прерывания работы компонента
      } finally {
        setIsLoading(false);
      }
    };

    checkCourses();
  }, [developerId]);

  // Не показываем блок, если нет курсов или идет загрузка
  if (isLoading || courses.length === 0) return null;

  return (
    <Card className="w-full bg-white dark:bg-[#2C2C2C] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <CardBody className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-2xl">
            <Image
              src="/images/academy.png"
              alt="Academy"
              width={40}
              height={40}
              priority
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-default-900 dark:text-white mb-2">
              {t("projectCertification.title")}
            </h3>
            <p className="text-default-500 dark:text-[#A1A1AA] text-sm">
              {t("projectCertification.description")}
            </p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors"
          >
            <IconSchool className="w-5 h-5" />
            <span>{t("projectCertification.button")}</span>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
