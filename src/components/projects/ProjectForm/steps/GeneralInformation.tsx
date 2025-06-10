import { GeneralInfoForm } from "../../forms/GeneralInfoForm";
import {
  ProjectWithTranslation,
  ProjectType,
  ProjectStatus
} from "@/types/project";
import { ProjectTranslation } from "@prisma/client";

interface GeneralInformationProps {
  project: ProjectWithTranslation;
  onSave: (data: {
    type: ProjectType;
    status: ProjectStatus;
    completionDate: string | null;
    siteUrl: string | null;
    deliveryStage: string;
    translations: Array<
      Omit<ProjectTranslation, "createdAt" | "updatedAt" | "language">
    >;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function GeneralInformation({
  project,
  onSave,
  isSaving
}: GeneralInformationProps) {
  return (
    <div className="space-y-6">
      <GeneralInfoForm project={project} onSave={onSave} isSaving={isSaving} />
    </div>
  );
}
