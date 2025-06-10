"use client";

import {
  Button,
  Checkbox,
  Divider,
  Input,
  Select,
  SelectItem
} from "@heroui/react";
import { useEffect, useState } from "react";

import { MarketingDocumentsForm } from "./MarketingDocumentsForm";
import { ProjectClass } from "@prisma/client";
import { ProjectWithTranslation } from "@/types/project";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SiteParametersFormProps {
  project: ProjectWithTranslation;
  onSave: (data: Partial<ProjectWithTranslation>) => Promise<void>;
  isSaving: boolean;
}

export function SiteParametersForm({
  project,
  onSave,
  isSaving = false
}: SiteParametersFormProps) {
  const t = useTranslations("projects");

  console.log(project.class?.toUpperCase() === ProjectClass.STANDARD);

  const [formData, setFormData] = useState({
    totalUnits: project.totalUnits || 0,
    constructionStatus: project.constructionStatus || 0,
    phase: project.phase || 1,
    totalLandArea: project.totalLandArea || 0,
    infrastructureArea: project.infrastructureArea || 0,
    class: project.class || "STANDARD"
  });

  useEffect(() => {
    console.log("Site parameters data:", {
      totalUnits: project.totalUnits,
      constructionStatus: project.constructionStatus,
      phase: project.phase,
      totalLandArea: project.totalLandArea,
      infrastructureArea: project.infrastructureArea,
      class: project.class
    });

    setFormData({
      totalUnits: project.totalUnits || 0,
      constructionStatus: project.constructionStatus || 0,
      phase: project.phase || 1,
      totalLandArea: project.totalLandArea || 0,
      infrastructureArea: project.infrastructureArea || 0,
      class: project.class || "STANDARD"
    });
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToUpdate = {
        totalUnits: formData.totalUnits,
        constructionStatus: formData.constructionStatus,
        phase: formData.phase,
        totalLandArea: formData.totalLandArea,
        infrastructureArea: formData.infrastructureArea,
        class: formData.class
      };

      console.log("Sending site parameters data:", dataToUpdate);
      await onSave(dataToUpdate);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(t("errors.parametersUpdateFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          label={t("form.totalLandArea")}
          value={formData.totalLandArea.toString()}
          onChange={e =>
            setFormData({
              ...formData,
              totalLandArea: parseInt(e.target.value) || 0
            })
          }
          min={0}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">м²</span>
            </div>
          }
        />

        <Input
          type="number"
          label={t("form.infrastructureArea")}
          value={formData.infrastructureArea.toString()}
          onChange={e =>
            setFormData({
              ...formData,
              infrastructureArea: parseInt(e.target.value) || 0
            })
          }
          min={0}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">м²</span>
            </div>
          }
        />

        <Input
          type="number"
          label={t("form.totalUnits")}
          value={formData.totalUnits.toString()}
          onChange={e =>
            setFormData({
              ...formData,
              totalUnits: parseInt(e.target.value) || 0
            })
          }
          min={0}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Select
          label={t("form.class")}
          selectedKeys={[formData.class.toUpperCase()]}
          onChange={e =>
            setFormData({
              ...formData,
              class: e.target.value as ProjectClass
            })
          }
          classNames={{
            trigger: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            value: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        >
          {Object.values(ProjectClass).map((projectClass, inx) => (
            <SelectItem key={projectClass} value={projectClass}>
              {t(`form.classOptions.${inx}`)}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label={t("form.constructionStatus")}
          value={formData.constructionStatus.toString()}
          onChange={e =>
            setFormData({
              ...formData,
              constructionStatus: parseInt(e.target.value) || 0
            })
          }
          min={0}
          max={100}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">%</span>
            </div>
          }
        />

        <Input
          type="number"
          label={t("form.phase")}
          value={formData.phase.toString()}
          onChange={e =>
            setFormData({
              ...formData,
              phase: parseInt(e.target.value) || 1
            })
          }
          min={1}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <div className="flex justify-end mt-6">
          <Button
            color="primary"
            className="px-8"
            type="submit"
            isLoading={isSaving}
          >
            {t("form.save")}
          </Button>
        </div>
      </form>

      <Divider className="my-6" />

      <MarketingDocumentsForm
        projectId={project.id}
        initialDocuments={project.documents}
        isSaving={isSaving}
        onSave={async data => {
          await onSave({ documents: data.documents });
        }}
      />
    </div>
  );
}
