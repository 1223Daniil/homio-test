"use client";

import { useTranslations } from "next-intl";
import { Text, Group, SimpleGrid, Paper, Title } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Project } from "@prisma/client";

interface HomePageClientProps {
  initialProjects: Project[];
}

export function HomePageClient({ initialProjects }: HomePageClientProps) {
  const t = useTranslations();

  const stats = [
    {
      title: t("projects.stats.total"),
      value: initialProjects?.length || 0,
      diff: 34
    },
    {
      title: t("projects.stats.active"),
      value: initialProjects?.filter(p => p.status === "ACTIVE").length || 0,
      diff: -13
    },
    {
      title: t("projects.stats.completed"),
      value: initialProjects?.filter(p => p.status === "COMPLETED").length || 0,
      diff: 18
    },
    {
      title: t("projects.stats.planning"),
      value: initialProjects?.filter(p => p.status === "PLANNING").length || 0,
      diff: -7
    }
  ];

  const statCards = stats.map(stat => {
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify-content="space-between">
          <div>
            <Text size="xs" c="dimmed">
              {stat.title}
            </Text>
            <Text fw={700} size="xl">
              {stat.value}
            </Text>
          </div>
          <div>
            <Text c={stat.diff > 0 ? "teal" : "red"} fw={700}>
              {stat.diff}%
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return (
    <DashboardLayout>
      <Title order={2} mb="xl">
        {t("Index.title")}
      </Title>

      <SimpleGrid
        cols={1}
        breakpoints={[
          { minWidth: "sm", cols: 2 },
          { minWidth: "lg", cols: 4 }
        ]}
      >
        {statCards}
      </SimpleGrid>
    </DashboardLayout>
  );
}
