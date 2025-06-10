import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Box
} from "@mui/material";
import { Project, Amenity, ProjectAmenity } from "@prisma/client";
import { useTranslations } from "next-intl";

interface Props {
  formData: Partial<Project> & {
    amenities?: ProjectAmenity[];
  };
  availableAmenities: Amenity[];
  setFormData: (data: Partial<Project> & {
    amenities?: ProjectAmenity[];
  }) => void;
}

export default function AmenitiesSection({ formData, availableAmenities, setFormData }: Props) {
  const t = useTranslations("pages.projects.form.amenities");

  const handleAmenityChange = (amenityId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentAmenities = formData.amenities || [];
    
    if (event.target.checked) {
      setFormData({
        ...formData,
        amenities: [...currentAmenities, {
          amenityId,
          projectId: formData.id!
        } as ProjectAmenity]
      });
    } else {
      setFormData({
        ...formData,
        amenities: currentAmenities.filter(a => a.amenityId !== amenityId)
      });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("features")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {availableAmenities.map(amenity => (
            <FormControlLabel
              key={amenity.id}
              control={
                <Checkbox
                  checked={formData.amenities?.some(a => a.amenityId === amenity.id) || false}
                  onChange={handleAmenityChange(amenity.id)}
                />
              }
              label={amenity.name}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}
