import { Grid, TextField } from "@mui/material";
import { Project, Location } from "@prisma/client";
import { useTranslations } from "next-intl";

interface Props {
  formData: Partial<Project> & {
    location?: Location;
  };
  setFormData: (data: Partial<Project> & {
    location?: Location;
  }) => void;
}

export default function LocationDetails({ formData, setFormData }: Props) {
  const t = useTranslations("pages.projects.form");

  const handleLocationChange =
    (field: keyof Location) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: event.target.value,
          latitude: formData.location?.latitude || 0,
          longitude: formData.location?.longitude || 0
        } as Location
      });
    };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t("country")}
          value={formData.location?.country || ""}
          onChange={handleLocationChange("country")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t("city")}
          value={formData.location?.city || ""}
          onChange={handleLocationChange("city")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("district")}
          value={formData.location?.district || ""}
          onChange={handleLocationChange("district")}
        />
      </Grid>
    </Grid>
  );
}
