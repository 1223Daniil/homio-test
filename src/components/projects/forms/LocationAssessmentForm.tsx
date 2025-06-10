"use client";

import { Button, Input } from "@heroui/react";

import { LocationAssessment } from "@/types/project";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface LocationAssessmentFormProps {
  project: LocationAssessment;
  onSave: (data: LocationAssessment) => Promise<void>;
  isSaving?: boolean;
}

export function LocationAssessmentForm({
  project,
  onSave,
  isSaving
}: LocationAssessmentFormProps) {
  const t = useTranslations("Projects");
  const [formData, setFormData] = useState({
    publicTransport: project.publicTransport?.toString() || "",
    amenitiesLevel: project.amenitiesLevel?.toString() || "",
    climateConditions: project.climateConditions?.toString() || "",
    beachAccess: project.beachAccess?.toString() || "",
    rentalDemand: project.rentalDemand?.toString() || "",
    safetyLevel: project.safetyLevel?.toString() || "",
    noiseLevel: project.noiseLevel?.toString() || "",
    schoolsAvailable: project.schoolsAvailable?.toString() || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        publicTransport: parseInt(formData.publicTransport) || null,
        amenitiesLevel: parseInt(formData.amenitiesLevel) || null,
        climateConditions: parseInt(formData.climateConditions) || null,
        beachAccess: parseInt(formData.beachAccess) || null,
        rentalDemand: parseInt(formData.rentalDemand) || null,
        safetyLevel: parseInt(formData.safetyLevel) || null,
        noiseLevel: parseInt(formData.noiseLevel) || null,
        schoolsAvailable: parseInt(formData.schoolsAvailable) || null
      });
    } catch (error) {
      console.error("Save error:", error);
      toast.error(t("locationAssessment.errors.updateError"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label={t("locationAssessment.publicTransport")}
          placeholder="1-10"
          value={formData.publicTransport}
          onChange={e =>
            setFormData(prev => ({ ...prev, publicTransport: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.amenitiesLevel")}
          placeholder="1-10"
          value={formData.amenitiesLevel}
          onChange={e =>
            setFormData(prev => ({ ...prev, amenitiesLevel: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.climateConditions")}
          placeholder="1-10"
          value={formData.climateConditions}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              climateConditions: e.target.value
            }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.beachAccess")}
          placeholder="1-10"
          value={formData.beachAccess}
          onChange={e =>
            setFormData(prev => ({ ...prev, beachAccess: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.rentalDemand")}
          placeholder="1-10"
          value={formData.rentalDemand}
          onChange={e =>
            setFormData(prev => ({ ...prev, rentalDemand: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.safetyLevel")}
          placeholder="1-10"
          value={formData.safetyLevel}
          onChange={e =>
            setFormData(prev => ({ ...prev, safetyLevel: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.noiseLevel")}
          placeholder="1-10"
          value={formData.noiseLevel}
          onChange={e =>
            setFormData(prev => ({ ...prev, noiseLevel: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />

        <Input
          type="number"
          label={t("locationAssessment.schoolsAvailable")}
          placeholder="1-10"
          value={formData.schoolsAvailable}
          onChange={e =>
            setFormData(prev => ({ ...prev, schoolsAvailable: e.target.value }))
          }
          min={1}
          max={10}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
        <Button color="primary" type="submit" isLoading={isSaving}>
          {t("forms.save")}
        </Button>
      </div>
    </form>
  );
}
