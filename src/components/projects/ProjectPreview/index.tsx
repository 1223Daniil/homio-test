import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Typography
} from "@mui/material";
import { Project, ProjectStatus } from "@prisma/client";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import Image from "next/image";

interface ProjectPreviewProps {
  project: Partial<
    Project & {
      media: { url: string }[];
      location: { city: string; country: string };
      amenities: { features: string[] };
      totalUnits: number;
    }
  >;
}

export default function ProjectPreview({ project }: ProjectPreviewProps) {
  const getStatusColor = (status: ProjectStatus | undefined) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "primary";
      case ProjectStatus.CONSTRUCTION:
        return "warning";
      case ProjectStatus.COMPLETED:
        return "success";
      case ProjectStatus.ACTIVE:
        return "info";
      case ProjectStatus.INACTIVE:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: ProjectStatus | undefined) => {
    return status?.toLowerCase().replace("_", " ") || "Unknown";
  };

  // Функция для проксирования URL изображений из Yandex Cloud
  const getProxiedImageUrl = (url?: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.includes('storage.yandexcloud.net')) {
      return `/api/image-proxy/${url.replace('https://storage.yandexcloud.net/', '')}`;
    }
    return url;
  };

  return (
    <Card sx={{ maxWidth: "100%", mb: 2 }}>
      <div style={{ height: 200, position: "relative" }}>
        <Image
          src={getProxiedImageUrl(project.media?.[0]?.url)}
          alt={project.name || ""}
          fill
          style={{ objectFit: "cover" }}
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 450px"
        />
      </div>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2
          }}
        >
          <Typography variant="h5" component="div">
            {project.name}
          </Typography>
          <Chip
            label={getStatusLabel(project.status)}
            color={getStatusColor(project.status)}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                {project.location?.city}, {project.location?.country}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BusinessIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                {project.totalUnits} units
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {project.amenities?.features
                ?.slice(0, 4)
                .map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
              {project.amenities?.features &&
                project.amenities.features.length > 4 && (
                  <Chip
                    label={`+${project.amenities.features.length - 4} more`}
                    size="small"
                  />
                )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
