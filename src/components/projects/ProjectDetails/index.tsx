"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Card,
  Grid,
  Title,
  Tabs,
  Text,
  Badge,
  Stack
} from "@mantine/core";
import {
  IconInfoCircle,
  IconMapPin,
  IconBuilding,
  IconPhoto,
  IconFileText,
  IconCreditCard
} from "@tabler/icons-react";
import { Project, ProjectTranslation, Location, ProjectMedia, ProjectDocument } from "@prisma/client";
import LocationSection from './sections/LocationSection';

interface ProjectDetailsProps {
  project: Project & {
    translations: ProjectTranslation[];
    location?: Location;
    media?: ProjectMedia[];
    documents?: ProjectDocument[];
  };
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState('0');
  const t = useTranslations("Projects");
  const locale = useLocale();

  const tabs = [
    {
      label: t("tabs.overview"),
      icon: <IconInfoCircle size={16} />
    },
    {
      label: t("tabs.location"),
      icon: <IconMapPin size={16} />
    },
    {
      label: t("tabs.units"),
      icon: <IconBuilding size={16} />
    },
    {
      label: t("tabs.gallery"),
      icon: <IconPhoto size={16} />
    },
    {
      label: t("tabs.documents"),
      icon: <IconFileText size={16} />
    },
    {
      label: t("tabs.paymentPlans"),
      icon: <IconCreditCard size={16} />
    }
  ];

  return (
    <Card>
      <Card.Section p="md">
        <Grid gutter="md">
          <Grid.Col xs={12}>
            <Stack spacing="md">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Title order={2}>
                  {project.translations.find(t => t.language === locale)?.name || t("untitled")}
                </Title>
                <Badge color={project.status === "ACTIVE" ? "green" : "gray"}>
                  {t(`status.${project.status}`)}
                </Badge>
              </Box>

              <Text color="dimmed">
                {project.translations.find(t => t.language === locale)?.description || t("noDescription")}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Tabs
              value={activeTab}
              onTabChange={(value: string | null) => {
                if (value) setActiveTab(value);
              }}
            >
              <Tabs.List>
                {tabs.map((tab, index) => (
                  <Tabs.Tab key={index} value={index.toString()} icon={tab.icon}>
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              <Box p="md">
                {activeTab === '0' && (
                  <Grid gutter="md">
                    <Grid.Col xs={12}>
                      <Title order={3} mb="md">
                        {t("tabs.overview")}
                      </Title>
                      <Text>
                        {project.translations.find(t => t.language === locale)?.description ||
                          t("noDescription")}
                      </Text>
                    </Grid.Col>
                  </Grid>
                )}

                {activeTab === '1' && (
                  <Box>
                    <Title order={3} mb="md">
                      {t("tabs.location")}
                    </Title>
                    {project.location ? (
                      <LocationSection location={project.location} />
                    ) : (
                      <Text>{t("noLocation")}</Text>
                    )}
                  </Box>
                )}

                {activeTab === '2' && (
                  <Box>
                    <Title order={3} mb="md">
                      {t("tabs.units")}
                    </Title>
                    <Text>{t("comingSoon")}</Text>
                  </Box>
                )}

                {activeTab === '3' && (
                  <Box>
                    <Title order={3} mb="md">
                      {t("tabs.gallery")}
                    </Title>
                    <Text>{t("comingSoon")}</Text>
                  </Box>
                )}

                {activeTab === '4' && (
                  <Box>
                    <Title order={3} mb="md">
                      {t("tabs.documents")}
                    </Title>
                    <Text>{t("comingSoon")}</Text>
                  </Box>
                )}

                {activeTab === '5' && (
                  <Box>
                    <Title order={3} mb="md">
                      {t("tabs.paymentPlans")}
                    </Title>
                    <Text>{t("comingSoon")}</Text>
                  </Box>
                )}
              </Box>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Card.Section>
    </Card>
  );
}
