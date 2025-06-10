"use client";

import {
  Button,
  Card,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
  Textarea
} from "@heroui/react";
import {
  Project,
  ProjectStatus,
  ProjectTranslation,
  ProjectType,
  UserRole
} from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { ProjectWithTranslation } from "@/types/project";
import { locales } from "@/config/i18n";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface FormData {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  developerId: string;
  completionDate: string;
  siteUrl: string;
  buildingStatus: string;
}

interface GeneralInfoFormProps {
  project: ProjectWithTranslation;
  onSave: (data: {
    type: ProjectType;
    status: ProjectStatus;
    completionDate: string | null;
    siteUrl: string | null;
    deliveryStage: string;
    developerId?: string;
    translations: Array<
      Omit<ProjectTranslation, "createdAt" | "updatedAt" | "language">
    >;
  }) => Promise<void>;
  isSaving: boolean;
}

export function GeneralInfoForm({
  project,
  onSave,
  isSaving
}: GeneralInfoFormProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const { hasRole } = useAuth();
  const [developers, setDevelopers] = useState<
    Array<{ id: string; translations: Array<{ name: string }> }>
  >([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    type: ProjectType.RESIDENTIAL,
    status: ProjectStatus.DRAFT,
    developerId: "",
    completionDate: "",
    siteUrl: "",
    buildingStatus: t.raw("projectStatuses.statuses.PLANNING"),
    locale: locale
  });
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [projectTranslations, setProjectTranslations] = useState<
    ProjectTranslation[]
  >([]);

  const isAdmin = useMemo(() => hasRole([UserRole.ADMIN]), [hasRole]);

  useEffect(() => {
    let mounted = true;

    const fetchDevelopers = async () => {
      if (!isAdmin || isLoadingDevelopers) return;

      setIsLoadingDevelopers(true);
      try {
        const response = await fetch("/api/developers");
        const data = await response.json();
        if (mounted) {
          setDevelopers(data);
        }
      } catch (error) {
        console.error("Error fetching developers:", error);
        if (mounted) {
          toast.error(t("errors.unknown"));
        }
      } finally {
        if (mounted) {
          setIsLoadingDevelopers(false);
        }
      }
    };

    fetchDevelopers();

    return () => {
      mounted = false;
    };
  }, [isAdmin, t]);

  useEffect(() => {
    if (!project) return;

    const translations = locales.map(locale => {
      const existingTranslation = project.translations?.find(
        t => t.language === locale
      );

      console.log(locale);

      return (
        existingTranslation || {
          projectId: project.id,
          language: locale,
          name: "",
          description: "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    });

    setProjectTranslations(translations);

    setFormData({
      name: project.translations?.[0]?.name || "",
      description: project.translations?.[0]?.description || "",
      type: project.type || ProjectType.RESIDENTIAL,
      status: project.status || ProjectStatus.DRAFT,
      developerId: project.developerId || "",
      completionDate: project.completionDate
        ? new Date(project.completionDate).toISOString().split("T")[0]
        : "",
      siteUrl: project.siteUrl || "",
      buildingStatus: project.buildingStatus || "PLANNING"
    });
  }, [project, t]);

  const handleLocaleChange = (newLocale: string) => {
    setSelectedLocale(newLocale);

    const hasTranslation = projectTranslations.some(
      t => t.language === newLocale
    );

    if (!hasTranslation) {
      setProjectTranslations([
        ...projectTranslations,
        {
          id: "",
          projectId: project.id,
          language: newLocale,
          name: "",
          description: "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  };

  const updateTranslation = (field: "name" | "description", value: string) => {
    setProjectTranslations(prevTranslations =>
      prevTranslations.map(t =>
        t.language === locale ? { ...t, [field]: value } : t
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);
    console.log(project);

    try {
      const completionDate = formData.completionDate
        ? new Date(formData.completionDate).toISOString()
        : null;

      let formattedSiteUrl = formData.siteUrl?.trim();
      if (formattedSiteUrl && !formattedSiteUrl.startsWith("http")) {
        formattedSiteUrl = `http://${formattedSiteUrl}`;
      }

      // if (!project.translations || project.translations.length === 0) {
      //   toast.error("NO TRANSLATION");
      //   return;
      // }

      console.log("2 FORM DATA", formData);

      const translations: Omit<
        ProjectTranslation,
        "createdAt" | "updatedAt"
      >[] = [];

      projectTranslations.forEach(t => {
        translations.push({
          id: t.id || "",
          projectId: project.id,
          name: t.name,
          description: t.description,
          language: t.language
        });
      });

      const dataToUpdate = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        completionDate,
        siteUrl: formattedSiteUrl,
        buildingStatus: formData.buildingStatus,
        ...(hasRole([UserRole.ADMIN]) && { developerId: formData.developerId }),
        translations,
        locale: locale
      };

      console.log("dataToUpdate", dataToUpdate);

      await onSave(dataToUpdate);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("FAILED SAVE");
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* <div className="flex gap-2 uppercase">
        {locales.map(locale => (
          <Button
            key={locale}
            color={selectedLocale === locale ? "primary" : "default"}
            onClick={() => handleLocaleChange(locale)}
            className="!uppercase"
          >
            {locale}
          </Button>
        ))}
      </div> */}

      <div>
        <Input
          label={t("forms.project.name")}
          placeholder={t("forms.project.name")}
          value={
            projectTranslations.find(t => t.language === locale)?.name || ""
          }
          onChange={e => updateTranslation("name", e.target.value)}
          isRequired
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />
      </div>

      <div>
        <Textarea
          label={t("forms.project.description")}
          placeholder={t("forms.project.description")}
          value={
            projectTranslations.find(t => t.language === locale)?.description ||
            ""
          }
          onChange={e => updateTranslation("description", e.target.value)}
          minRows={4}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />
      </div>

      {hasRole([UserRole.ADMIN]) && (
        <div>
          <Select
            label={t("developer")}
            placeholder={t("selectDeveloperPlaceholder")}
            selectedKeys={formData.developerId ? [formData.developerId] : []}
            onChange={e =>
              setFormData({ ...formData, developerId: e.target.value })
            }
            isDisabled={isSaving || isLoadingDevelopers}
            classNames={{
              trigger: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
              value: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
            }}
          >
            {isLoadingDevelopers ? (
              <SelectItem key="loading" value="loading">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{"LOADING"}</span>
                </div>
              </SelectItem>
            ) : (
              developers.map(developer => (
                <SelectItem key={developer.id} value={developer.id}>
                  {developer.translations[0]?.name || t("unnamed")}
                </SelectItem>
              ))
            )}
          </Select>
        </div>
      )}

      <div>
        <p className="text-default-900 dark:text-white text-sm mb-1">
          {t("forms.project.type")}
        </p>
        <RadioGroup
          color="primary"
          orientation="horizontal"
          value={formData.type}
          onValueChange={value =>
            setFormData({ ...formData, type: value as ProjectType })
          }
          classNames={{
            label: "text-default-900 dark:text-white"
          }}
        >
          <Radio
            value={ProjectType.RESIDENTIAL}
            description={
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <span className="text-default-900 dark:text-white">
                  {t("types.residential")}
                </span>
              </div>
            }
          />
          <Radio
            value={ProjectType.COMMERCIAL}
            description={
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <span className="text-default-900 dark:text-white">
                  {t("types.commercial")}
                </span>
              </div>
            }
          />
          <Radio
            value={ProjectType.MIXED_USE}
            description={
              <div className="flex items-center gap-2">
                <span className="text-xl">🏘️</span>
                <span className="text-default-900 dark:text-white">
                  {t("types.mixedUse")}
                </span>
              </div>
            }
          />
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label={t("projectStatuses.label")}
            defaultSelectedKeys={[formData.buildingStatus]}
            selectedKeys={
              formData.buildingStatus ? [formData.buildingStatus] : []
            }
            value={formData.buildingStatus}
            onChange={e =>
              setFormData({ ...formData, buildingStatus: e.target.value })
            }
            classNames={{
              trigger: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
              value: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
            }}
          >
            {Object.entries(t.raw("projectStatuses.statuses")).map(
              ([key, value]: [string, string]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              )
            )}
          </Select>
        </div>

        <div>
          <Input
            label={t("forms.project.completionDate")}
            type="date"
            value={formData.completionDate}
            onChange={e =>
              setFormData({ ...formData, completionDate: e.target.value })
            }
            classNames={{
              input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
              inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
            }}
          />
        </div>
      </div>

      <div>
        <Input
          label={t("forms.project.siteUrl")}
          placeholder="example.com"
          value={formData.siteUrl}
          onChange={e => setFormData({ ...formData, siteUrl: e.target.value })}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
        <Button
          color="primary"
          className="px-8"
          type="submit"
          isLoading={isSaving}
          isDisabled={isSaving}
        >
          {isSaving ? t("saving") : t("forms.project.save")}
        </Button>
      </div>
    </form>
  );
}
