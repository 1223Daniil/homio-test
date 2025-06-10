"use client";

import { Building2, DollarSign, Home, MapPin } from "lucide-react";
import { Card, CardBody, Image, Slider } from "@heroui/react";
import React, { useState } from "react";

import { DomainProject } from "@/types/domain";
import ProjectAmenities from "../projects/ProjectAmenities";
import ProjectCardSimple from "./ProjectCardSimple";
import { useRouter } from "@/utils/i18n";
import { useTranslations } from "next-intl";

interface ProjectListProps {
  projects: DomainProject[];
  onProjectUpdate?: (updatedProject: DomainProject) => void;
}

export function ProjectList({ projects, onProjectUpdate }: ProjectListProps) {
  const t = useTranslations("Projects");
  const router = useRouter();

  if (!projects || projects.length === 0) {
    return <div className="text-center py-8">{t("noProjects")}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCardSimple
          key={project.id}
          project={project}
          onEdit={onProjectUpdate}
        />
      ))}
    </div>
  );
}
