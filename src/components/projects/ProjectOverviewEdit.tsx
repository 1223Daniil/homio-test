import { useTranslations } from "next-intl";
import { TextInput, Textarea, Select, Grid, NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ProjectType, ProjectStatus } from "@/types/project";

interface FormData {
  type: ProjectType;
  status: ProjectStatus;
  translations: {
    locale: string;
    name: string;
    description: string;
  }[];
  location: string;
  startDate: string | null;
  completionDate: string | null;
  totalUnits: number | null;
}

interface ProjectOverviewEditProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  updateTranslation: (field: string, value: string) => void;
}

export function ProjectOverviewEdit({
  formData,
  updateFormData,
  updateTranslation
}: ProjectOverviewEditProps) {
  const t = useTranslations("Projects");

  return (
    <Grid>
      <Grid.Col span={12}>
        <TextInput
          label={t("form.name")}
          required
          value={formData.translations[0].name}
          onChange={e => updateTranslation("name", e.target.value)}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Textarea
          label={t("form.description")}
          minRows={3}
          value={formData.translations[0].description}
          onChange={e => updateTranslation("description", e.target.value)}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <Select
          label={t("type.label")}
          required
          value={formData.type}
          onChange={value => updateFormData("type", value)}
          data={Object.values(ProjectType).map(type => ({
            value: type,
            label: t(`type.${type}`)
          }))}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <Select
          label={t("status.label")}
          required
          value={formData.status}
          onChange={value => updateFormData("status", value)}
          data={Object.values(ProjectStatus).map(status => ({
            value: status,
            label: t(`status.${status}`)
          }))}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label={t("form.location")}
          value={formData.location}
          onChange={e => updateFormData("location", e.target.value)}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <DateInput
          label={t("form.startDate")}
          placeholder="Pick a date"
          value={formData.startDate ? new Date(formData.startDate) : null}
          onChange={date =>
            updateFormData("startDate", date?.toISOString() || null)
          }
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <DateInput
          label={t("form.completionDate")}
          placeholder="Pick a date"
          value={
            formData.completionDate ? new Date(formData.completionDate) : null
          }
          onChange={date =>
            updateFormData("completionDate", date?.toISOString() || null)
          }
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label={t("form.totalUnits")}
          value={formData.totalUnits || ""}
          onChange={value => updateFormData("totalUnits", value)}
        />
      </Grid.Col>
    </Grid>
  );
}
