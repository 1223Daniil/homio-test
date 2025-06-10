"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
  Chip,
  Stack
} from "@mui/material";
import { useRouter } from "next/navigation";
import type { Project, Location, ProjectPricing } from "@prisma/client";

interface ProjectListProps {
  projects: (Project & {
    location?: Location;
    pricing?: ProjectPricing;
  })[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const t = useTranslations("projects");
  const router = useRouter();

  const formatPrice = (priceRange: any) => {
    if (!priceRange) return "";
    const { min, currency } = priceRange;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(min);
  };

  return (
    <Grid container spacing={3}>
      {projects.map(project => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <Card>
            <CardActionArea
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {project.name}
                </Typography>

                <Stack direction="row" spacing={1} mb={2}>
                  <Chip
                    label={project.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {project.location && (
                    <Chip
                      label={`${(project.location as any).city}, ${(project.location as any).country}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {project.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {project.description}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {project.totalLandArea} m²
                  </Typography>
                  {project.pricing && (
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight="bold"
                    >
                      From {formatPrice(project.pricing)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
      {projects.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1" textAlign="center">
            {t("noProjects")}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
