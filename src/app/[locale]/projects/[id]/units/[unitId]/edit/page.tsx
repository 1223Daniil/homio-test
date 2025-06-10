"use client";

import { Accordion, AccordionItem, Button } from "@heroui/react";
import { Prisma, UnitMediaCategory, UnitStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { Container } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { MediaForm } from "@/components/units/forms/MediaForm";
import { UnitForm } from "@/components/units/forms/UnitForm";
import { toast } from "sonner";
import { translateText } from "@/utils/aiTranslator";

interface UnitWithMedia {
  id: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number;
  price: number;
  status: UnitStatus;
  layoutId?: string;
  name?: string;
  description?: string;
  media: Array<{
    id: string;
    url: string;
    title?: string | null;
    category: UnitMediaCategory;
    type: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface UnitFormData {
  name: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  floor: number;
  price: number;
  status: UnitStatus;
  layoutPlan?: string;
}

const mediaCategories = [
  {
    key: "gallery",
    label: "Images of this unit",
    category: UnitMediaCategory.GALLERY
  }
];

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams<{ id: string; unitId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<UnitWithMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Units");

  const fetchUnit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/projects/${params.id}/units/${params.unitId}?include=media`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch unit");
      }
      
      const data = await response.json();
      setUnit(data);
    } catch (error) {
      console.error("Error fetching unit:", error);
      setError(t("errors.fetch"));
      toast.error(t("errors.fetch"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id && params.unitId) {
      fetchUnit();
    }
  }, [params.id, params.unitId]);

  const handleSave = async (data: Prisma.UnitUpdateInput) => {
    try {
      setIsSaving(true);

      if (!data || !params.unitId) {
        throw new Error("Missing required data");
      }

      // Убедимся, что необходимые строковые поля всегда будут строками, а не null
      const sanitizedData = {
        ...data,
        name: data.name || "",
        description: data.description || ""
      };

      const dataToTranslate = {
        name: sanitizedData.name,
        description: sanitizedData.description
      };

      const payload = {
        ...sanitizedData,
        translations: dataToTranslate
      };

      const response = await fetch(
        `/api/projects/${params.id}/units/${params.unitId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error details:", errorData);
        throw new Error(
          errorData.message || errorData.error || "Failed to update unit"
        );
      }

      const result = await response.json();

      await fetchUnit();

      toast.success(t("messages.success"));
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error(error instanceof Error ? error.message : t("errors.update"));
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <Container fluid p={0}>
        <div className="fixed top-0 left-0 w-full h-[200px] bg-[#F5F5F7] dark:bg-[#1A1A1A] -z-10" />
        <div className="max-w-[1024px] mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Button
                variant="light"
                color="primary"
                startContent={<IconArrowLeft size={20} />}
                onClick={() => router.back()}
              >
                {t("buttons.back")}
              </Button>
            </div>
          </div>
          <div className="h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4">{t("errors.project.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button 
              color="primary" 
              className="mt-4"
              onClick={() => fetchUnit()}
            >
              {t("buttons.retry")}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (isLoading || !unit) {
    return (
      <Container fluid p={0}>
        <div className="h-[400px] flex items-center justify-center">
          Loading...
        </div>
      </Container>
    );
  }

  return (
    <Container fluid p={0}>
      <div className="fixed top-0 left-0 w-full h-[200px] bg-[#F5F5F7] dark:bg-[#1A1A1A] -z-10" />

      <div className="max-w-[1024px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="light"
              color="primary"
              startContent={<IconArrowLeft size={20} />}
              onClick={() => router.back()}
            >
              {t("buttons.back")}
            </Button>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {t("title")}
            </h1>
            <p className="text-sm text-default-600">{t("subtitle")}</p>
          </div>
        </div>

        {/* Content */}
        <Accordion
          selectionMode="multiple"
          className="space-y-3"
          defaultSelectedKeys={["general"]}
        >
          {[
            <AccordionItem
              key="general"
              aria-label="General information"
              classNames={{
                base: "border border-default-200 rounded-xl overflow-hidden",
                title: "font-semibold text-lg text-default-900 dark:text-white",
                trigger:
                  "px-6 py-4 data-[hover=true]:bg-default-100 dark:data-[hover=true]:bg-[#2c2c2c]",
                content: "px-6 py-4",
                indicator: "text-default-600 dark:text-gray-400",
                heading: "bg-white dark:bg-[#242424]"
              }}
              title={
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {t("form.unit.label")}
                  </h2>
                </div>
              }
            >
              <div className="space-y-6 bg-white dark:bg-[#242424] rounded-b-lg -mx-6 -mb-4 p-6">
                <UnitForm unit={unit} onSave={handleSave} isSaving={isSaving} />
              </div>
            </AccordionItem>,
            ...mediaCategories.map(({ key, label, category }) => (
              <AccordionItem
                key={key}
                aria-label={t("form.images.label")}
                classNames={{
                  base: "border border-default-200 rounded-xl overflow-hidden",
                  title:
                    "font-semibold text-lg text-default-900 dark:text-white",
                  trigger:
                    "px-6 py-4 data-[hover=true]:bg-default-100 dark:data-[hover=true]:bg-[#2c2c2c]",
                  content: "px-6 py-4",
                  indicator: "text-default-600 dark:text-gray-400",
                  heading: "bg-white dark:bg-[#242424]"
                }}
                title={
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {t("form.images.label")}
                    </h2>
                  </div>
                }
              >
                <div className="space-y-6 bg-white dark:bg-[#242424] rounded-b-lg -mx-6 -mb-4 p-6">
                  <MediaForm
                    unitId={params.unitId}
                    projectId={params.id}
                    category={category}
                    media={unit.media}
                    onMediaUpdate={fetchUnit}
                  />
                </div>
              </AccordionItem>
            ))
          ]}
        </Accordion>
      </div>
    </Container>
  );
}
