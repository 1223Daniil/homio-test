import { Box, Grid, Typography } from "@mui/material";
import { Project, ProjectMedia } from "@prisma/client";
import { useTranslations } from "next-intl";
import { ImageUpload } from "@/components/common/ImageUpload";

interface Props {
  formData: Partial<Project> & {
    media?: ProjectMedia[];
  };
  setFormData: (data: Partial<Project> & {
    media?: ProjectMedia[];
  }) => void;
}

export default function GallerySection({ formData, setFormData }: Props) {
  const t = useTranslations("pages.projects.form");

  const handleImagesChange = (images: string[]) => {
    setFormData({
      ...formData,
      media: images.map(url => ({
        projectId: formData.id!,
        url,
        type: "image",
        category: "BANNER"
      } as ProjectMedia))
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("gallery.title")}
        </Typography>
        <ImageUpload
          multiple
          value={formData.media?.map(img => img.url) || []}
          onChange={handleImagesChange}
        />
      </Grid>
    </Grid>
  );
}
