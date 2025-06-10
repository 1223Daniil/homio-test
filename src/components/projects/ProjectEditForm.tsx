"use client";

import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  IconBuildingCommunity,
  IconBuildingEstate,
  IconCalendar,
  IconCurrencyDollar,
  IconHome,
  IconMap,
  IconPercentage,
  IconPhoto,
  IconRuler,
  IconTrash,
  IconUpload,
  IconUsers,
  IconX
} from "@tabler/icons-react";
import {
  Location,
  Project,
  ProjectAmenity,
  ProjectClass,
  ProjectDocument,
  ProjectMedia,
  ProjectPricing,
  ProjectStatus,
  ProjectTranslation,
  ProjectType,
  ProjectYield,
  Unit
} from "@prisma/client";
import { ProjectBase, ProjectWithTranslation } from "@/types/project";
import { useLocale, useTranslations } from "next-intl";

import { CurrencyCode } from "@/utils/currency";
import { CurrencySettingsForm } from "./forms/CurrencySettingsForm";
import { SpecialOffer } from "@/types/project";
import { getMediaUrl } from "@/lib/utils";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

type EditedProject = Omit<
  ProjectWithTranslation,
  "constructionStatus" | "phase" | "class"
> & {
  totalLandArea: number | null;
  infrastructureArea: number | null;
  totalUnits: number | null;
  totalBuildings: number | null;
  buildingProgress: number | null;
  constructionStatus: number | null;
  phase: number | null;
  class: ProjectClass | undefined;
  deliveryStage: string | null;
  siteUrl: string | null;
  tour3d: string | null;
  purchaseConditions: string | null;
  marketingAssets: string | null;
};

interface ProjectEditFormProps {
  project: ProjectWithTranslation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProject: ProjectWithTranslation) => void;
}

export function ProjectEditForm({
  project,
  isOpen,
  onClose,
  onSuccess
}: ProjectEditFormProps) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [editedProject, setEditedProject] = useState<EditedProject>({
    ...project,
    translations: project.translations ?? [],
    totalLandArea: project.totalLandArea ?? null,
    infrastructureArea: project.infrastructureArea ?? null,
    totalUnits: project.totalUnits ?? null,
    constructionStatus: project.constructionStatus ?? null,
    phase: project.phase ?? null,
    class: project.class,
    pricing: project.pricing ?? {
      id: "",
      projectId: project.id,
      basePrice: 0,
      pricePerSqm: 0,
      currencyId: "THB",
      maintenanceFee: 0,
      maintenanceFeePeriod: "monthly",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    yield: project.yield ?? {
      id: "",
      projectId: project.id,
      guaranteed: 0,
      potential: 0,
      occupancy: 0,
      years: "5",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    location: project.location ?? {
      id: "",
      country: "",
      city: "",
      district: "",
      address: "",
      latitude: 0,
      longitude: 0,
      beachDistance: null,
      centerDistance: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    completionDate: project.completionDate ?? null,
    status: project.status ?? ProjectStatus.DRAFT,
    media: project.media ?? [],
    type: project.type,
    id: project.id,
    amenities: project.amenities ?? [],
    units: project.units ?? [],
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    project.media?.[0]?.url || null
  );

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files]);
  };

  const handleImageDelete = (imageUrl: string) => {
    if (imageUrl.startsWith("blob:")) {
      // Remove from uploaded files
      const fileName = imageUrl.split("/").pop();
      setUploadedImages(uploadedImages.filter(file => file.name !== fileName));
    } else {
      // Mark existing image for deletion
      setImagesToDelete(prev => [...prev, imageUrl]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // First, handle image uploads if any
      let newMediaItems: ProjectMedia[] = [];
      if (uploadedImages.length > 0) {
        const formData = new FormData();
        uploadedImages.forEach(file => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/media/upload", {
          method: "POST",
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(t("messages.error.upload"));
        }

        const uploadedUrls = await uploadResponse.json();
        newMediaItems = uploadedUrls.map((url: string, index: number) => ({
          id: `new-${index}`,
          url,
          type: "image",
          order: (editedProject?.media?.length || 0) + index
        }));
      }

      // Filter out deleted images and add new ones
      const updatedMedia = [
        ...(editedProject?.media || []).filter(
          media => !imagesToDelete.includes(media.url)
        ),
        ...newMediaItems
      ];

      // Prepare final project data
      const finalProjectData = {
        ...editedProject,
        media: updatedMedia,
        totalLandArea: editedProject.totalLandArea || null,
        infrastructureArea: editedProject.infrastructureArea || null,
        totalUnits: editedProject.totalUnits || null,
        constructionStatus: editedProject.constructionStatus || 0,
        phase: editedProject.phase || 1,
        class: editedProject.class || "STANDARD"
      };

      // Update project with new data
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalProjectData)
      });

      if (!response.ok) {
        throw new Error(t("messages.error.update"));
      }

      const updatedProject = await response.json();

      notifications.show({
        title: t("messages.success.title"),
        message: t("messages.success.update"),
        color: "green"
      });

      onSuccess(updatedProject);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      notifications.show({
        title: t("messages.error.title"),
        message:
          error instanceof Error ? error.message : t("messages.error.update"),
        color: "red"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof EditedProject>(
    field: K,
    value: EditedProject[K]
  ) => {
    setEditedProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTranslation = (
    field: keyof Omit<ProjectTranslation, "language">,
    value: string
  ) => {
    setEditedProject(prev => ({
      ...prev,
      translations: prev.translations.map(trans =>
        trans.language === locale ? { ...trans, [field]: value } : trans
      )
    }));
  };

  const handleStatusChange = (value: string | null) => {
    if (
      value &&
      Object.values(ProjectStatus).includes(value as ProjectStatus)
    ) {
      updateField("status", value as ProjectStatus);
    }
  };

  const handleNumberInput = (
    field: keyof EditedProject,
    value: number | ""
  ) => {
    if (typeof value === "number") {
      updateField(field, value);
    } else {
      // If the field is cleared, set it to null
      updateField(field, null);
    }
  };

  const handleLocationChange =
    (field: keyof Location) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedLocation: Location = {
        id: editedProject.location?.id || "",
        country: editedProject.location?.country || "",
        city: editedProject.location?.city || "",
        district: editedProject.location?.district || "",
        address: editedProject.location?.address || "",
        latitude: editedProject.location?.latitude || 0,
        longitude: editedProject.location?.longitude || 0,
        beachDistance: editedProject.location?.beachDistance || null,
        centerDistance: editedProject.location?.centerDistance || null,
        createdAt: editedProject.location?.createdAt || new Date(),
        updatedAt: new Date(),
        [field]: e.target.value
      };
      updateField("location", updatedLocation);
    };

  const handleDistanceChange =
    (field: "beachDistance" | "centerDistance") => (value: number | "") => {
      if (typeof value === "number") {
        const updatedLocation: Location = {
          id: editedProject.location?.id || "",
          country: editedProject.location?.country || "",
          city: editedProject.location?.city || "",
          district: editedProject.location?.district || "",
          address: editedProject.location?.address || "",
          latitude: editedProject.location?.latitude || 0,
          longitude: editedProject.location?.longitude || 0,
          beachDistance:
            field === "beachDistance"
              ? value
              : editedProject.location?.beachDistance || null,
          centerDistance:
            field === "centerDistance"
              ? value
              : editedProject.location?.centerDistance || null,
          createdAt: editedProject.location?.createdAt || new Date(),
          updatedAt: new Date()
        };
        updateField("location", updatedLocation);
      }
    };

  const handleCurrencyUpdate = async (data: { currency: CurrencyCode }) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Failed to update currency");

      const updatedProject = await response.json();
      setEditedProject(prev => ({
        ...prev,
        currency: data.currency
      }));

      notifications.show({
        title: t("messages.success"),
        message: t("currency.messages.updateSuccess"),
        color: "green"
      });
    } catch (error) {
      console.error("Currency update error:", error);
      notifications.show({
        title: t("messages.error"),
        message: t("currency.messages.updateError"),
        color: "red"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={t("form.edit")}
      size="100%"
      fullScreen
    >
      <Box pos="relative">
        <LoadingOverlay visible={loading} />

        <Container size="xl">
          <Grid>
            <Grid.Col span={8}>
              <Stack spacing="md">
                <Group position="apart">
                  <TextInput
                    label={t("form.name")}
                    value={
                      editedProject.translations.find(
                        t => t.language === locale
                      )?.name || ""
                    }
                    onChange={e => updateTranslation("name", e.target.value)}
                    size="lg"
                    style={{ flex: 1 }}
                    required
                  />
                  <Select
                    label={t("form.status")}
                    value={editedProject.status}
                    onChange={handleStatusChange}
                    data={Object.values(ProjectStatus).map(status => ({
                      value: status,
                      label: t(`status.${status}`)
                    }))}
                    size="lg"
                    style={{ width: 200 }}
                  />
                </Group>

                {/* Media Gallery */}
                <Card mb="md">
                  <AspectRatio ratio={16 / 9}>
                    {selectedImage && (
                      <Image
                        alt={selectedImage}
                        src={
                          selectedImage.startsWith("blob:")
                            ? selectedImage
                            : getMediaUrl(selectedImage)
                        }
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </AspectRatio>

                  <Dropzone
                    onDrop={handleImageUpload}
                    accept={IMAGE_MIME_TYPE}
                    maxSize={5 * 1024 * 1024}
                    mt="sm"
                    p="xs"
                  >
                    <Group
                      position="center"
                      spacing="xl"
                      style={{ minHeight: 50, pointerEvents: "none" }}
                    >
                      <Dropzone.Accept>
                        <IconUpload size="2rem" stroke={1.5} />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <IconX size="2rem" stroke={1.5} />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        <IconPhoto size="2rem" stroke={1.5} />
                      </Dropzone.Idle>

                      <div>
                        <Text size="md" inline>
                          {t("media.dragImages")}
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                          {t("media.imageRequirements")}
                        </Text>
                      </div>
                    </Group>
                  </Dropzone>

                  <SimpleGrid cols={6} mt="sm">
                    {/* Existing images */}
                    {editedProject?.media
                      ?.filter(media => !imagesToDelete.includes(media.url))
                      .map(media => (
                        <Paper key={media.id} p="xs" withBorder>
                          <Box pos="relative">
                            <ActionIcon
                              color="red"
                              variant="filled"
                              size="sm"
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                zIndex: 10
                              }}
                              onClick={() => handleImageDelete(media.url)}
                            >
                              <IconTrash size="1rem" />
                            </ActionIcon>
                            <Image
                              src={getMediaUrl(media.url)}
                              alt={media.title || ""}
                              height={80}
                              fit="cover"
                              style={{
                                cursor: "pointer",
                                opacity: selectedImage === media.url ? 1 : 0.6
                              }}
                              onClick={() => setSelectedImage(media.url)}
                            />
                          </Box>
                        </Paper>
                      ))}

                    {/* New images */}
                    {uploadedImages.map((file, index) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <Paper key={index} p="xs" withBorder>
                          <Box pos="relative">
                            <ActionIcon
                              color="red"
                              variant="filled"
                              size="sm"
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                zIndex: 10
                              }}
                              onClick={() => handleImageDelete(url)}
                            >
                              <IconTrash size="1rem" />
                            </ActionIcon>
                            <Image
                              src={url}
                              alt={file.name}
                              height={80}
                              fit="cover"
                              style={{
                                cursor: "pointer",
                                opacity: selectedImage === url ? 1 : 0.6
                              }}
                              onClick={() => setSelectedImage(url)}
                            />
                          </Box>
                        </Paper>
                      );
                    })}
                  </SimpleGrid>
                </Card>

                <Tabs defaultValue="overview">
                  <Tabs.List>
                    <Tabs.Tab value="overview" icon={<IconHome size={16} />}>
                      {t("tabs.overview")}
                    </Tabs.Tab>
                    <Tabs.Tab value="location" icon={<IconMap size={16} />}>
                      {t("tabs.location")}
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="amenities"
                      icon={<IconBuildingCommunity size={16} />}
                    >
                      {t("tabs.amenities")}
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="units"
                      icon={<IconBuildingEstate size={16} />}
                    >
                      {t("tabs.units")}
                    </Tabs.Tab>
                    <Tabs.Tab value="parameters" icon={<IconRuler size={16} />}>
                      {t("tabs.parameters")}
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="currency"
                      icon={<IconCurrencyDollar size={16} />}
                    >
                      {t("tabs.currency")}
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="overview">
                    <Paper p="md" mt="md">
                      <Stack>
                        <Textarea
                          label={t("form.description")}
                          value={
                            editedProject.translations.find(
                              t => t.language === locale
                            )?.description || ""
                          }
                          onChange={e =>
                            updateTranslation("description", e.target.value)
                          }
                          minRows={3}
                        />
                        <SimpleGrid cols={2}>
                          <Stack>
                            <Group align="flex-start">
                              <IconCalendar size={24} />
                              <div style={{ flex: 1 }}>
                                <TextInput
                                  label={t("form.completionDate")}
                                  value={
                                    editedProject.completionDate?.toISOString() ||
                                    ""
                                  }
                                  onChange={e =>
                                    updateField(
                                      "completionDate",
                                      new Date(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </Group>
                            <Group align="flex-start">
                              <IconUsers size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.totalUnits")}
                                  value={editedProject.totalUnits || 0}
                                  onChange={value =>
                                    handleNumberInput("totalUnits", value)
                                  }
                                  min={0}
                                  step={1}
                                />
                              </div>
                            </Group>
                          </Stack>
                          <Stack>
                            <Group align="flex-start">
                              <IconPercentage size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("yield.guaranteed")}
                                  value={editedProject.yield?.guaranteed || 0}
                                  onChange={value => {
                                    if (typeof value === "number") {
                                      const updatedYield = {
                                        ...editedProject.yield,
                                        guaranteed: value,
                                        id: editedProject.yield?.id || "",
                                        projectId: project.id,
                                        createdAt:
                                          editedProject.yield?.createdAt ||
                                          new Date(),
                                        updatedAt: new Date(),
                                        potential:
                                          editedProject.yield?.potential || 0,
                                        occupancy:
                                          editedProject.yield?.occupancy || 0
                                      } as ProjectYield;
                                      updateField("yield", updatedYield);
                                    }
                                  }}
                                  min={0}
                                  max={100}
                                  precision={1}
                                  step={0.1}
                                />
                                <NumberInput
                                  label={t("yield.potential")}
                                  value={editedProject.yield?.potential || 0}
                                  onChange={value => {
                                    if (typeof value === "number") {
                                      const updatedYield = {
                                        ...editedProject.yield,
                                        potential: value,
                                        id: editedProject.yield?.id || "",
                                        projectId: project.id,
                                        createdAt:
                                          editedProject.yield?.createdAt ||
                                          new Date(),
                                        updatedAt: new Date(),
                                        guaranteed:
                                          editedProject.yield?.guaranteed || 0,
                                        occupancy:
                                          editedProject.yield?.occupancy || 0
                                      } as ProjectYield;
                                      updateField("yield", updatedYield);
                                    }
                                  }}
                                  min={0}
                                  max={100}
                                  precision={1}
                                  step={0.1}
                                  mt="sm"
                                />
                                <NumberInput
                                  label={t("yield.occupancy")}
                                  value={editedProject.yield?.occupancy || 0}
                                  onChange={value => {
                                    if (typeof value === "number") {
                                      const updatedYield = {
                                        ...editedProject.yield,
                                        occupancy: value,
                                        id: editedProject.yield?.id || "",
                                        projectId: project.id,
                                        createdAt:
                                          editedProject.yield?.createdAt ||
                                          new Date(),
                                        updatedAt: new Date(),
                                        guaranteed:
                                          editedProject.yield?.guaranteed || 0,
                                        potential:
                                          editedProject.yield?.potential || 0
                                      } as ProjectYield;
                                      updateField("yield", updatedYield);
                                    }
                                  }}
                                  min={0}
                                  max={100}
                                  precision={1}
                                  step={0.1}
                                  mt="sm"
                                />
                              </div>
                            </Group>
                          </Stack>
                        </SimpleGrid>
                      </Stack>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="location">
                    <Paper p="md" mt="md">
                      <Stack>
                        <Group grow>
                          <TextInput
                            label={t("form.city")}
                            value={editedProject.location?.city || ""}
                            onChange={handleLocationChange("city")}
                          />
                          <TextInput
                            label={t("form.district")}
                            value={editedProject.location?.district || ""}
                            onChange={handleLocationChange("district")}
                          />
                        </Group>
                        <Group grow>
                          <TextInput
                            label={t("form.country")}
                            value={editedProject.location?.country || ""}
                            onChange={handleLocationChange("country")}
                          />
                          <NumberInput
                            label={t("form.beachDistance")}
                            value={editedProject.location?.beachDistance || 0}
                            onChange={handleDistanceChange("beachDistance")}
                            min={0}
                            step={0.1}
                            precision={1}
                          />
                        </Group>
                        <Group grow>
                          <NumberInput
                            label={t("form.centerDistance")}
                            value={editedProject.location?.centerDistance || 0}
                            onChange={handleDistanceChange("centerDistance")}
                            min={0}
                            step={0.1}
                            precision={1}
                          />
                        </Group>
                      </Stack>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="amenities">
                    <Paper p="md" mt="md">
                      {/* Amenities editing will be implemented later */}
                      <Text c="dimmed">{t("form.amenitiesComingSoon")}</Text>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="units">
                    <Paper p="md" mt="md">
                      {/* Units editing will be implemented later */}
                      <Text c="dimmed">{t("form.unitsComingSoon")}</Text>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="parameters">
                    <Paper p="md" mt="md">
                      <Stack>
                        <SimpleGrid cols={2}>
                          <Stack>
                            <Group align="flex-start">
                              <IconRuler size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.totalLandArea")}
                                  value={editedProject.totalLandArea || 0}
                                  onChange={value =>
                                    handleNumberInput("totalLandArea", value)
                                  }
                                  min={0}
                                  step={1}
                                  precision={2}
                                />
                              </div>
                            </Group>
                            <Group align="flex-start">
                              <IconRuler size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.infrastructureArea")}
                                  value={editedProject.infrastructureArea || 0}
                                  onChange={value =>
                                    handleNumberInput(
                                      "infrastructureArea",
                                      value
                                    )
                                  }
                                  min={0}
                                  step={1}
                                  precision={2}
                                />
                              </div>
                            </Group>
                            <Group align="flex-start">
                              <IconUsers size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.totalUnits")}
                                  value={editedProject.totalUnits || 0}
                                  onChange={value =>
                                    handleNumberInput("totalUnits", value)
                                  }
                                  min={0}
                                  step={1}
                                />
                              </div>
                            </Group>
                          </Stack>
                          <Stack>
                            <Group align="flex-start">
                              <IconPercentage size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.constructionStatus")}
                                  value={editedProject.constructionStatus || 0}
                                  onChange={value =>
                                    handleNumberInput(
                                      "constructionStatus",
                                      value
                                    )
                                  }
                                  min={0}
                                  max={100}
                                  step={1}
                                />
                              </div>
                            </Group>
                            <Group align="flex-start">
                              <IconBuildingEstate size={24} />
                              <div style={{ flex: 1 }}>
                                <NumberInput
                                  label={t("form.phase")}
                                  value={editedProject.phase || 1}
                                  onChange={value =>
                                    handleNumberInput("phase", value)
                                  }
                                  min={1}
                                  step={1}
                                />
                              </div>
                            </Group>
                            <Group align="flex-start">
                              <IconBuildingCommunity size={24} />
                              <div style={{ flex: 1 }}>
                                <Select
                                  label={t("form.class")}
                                  value={editedProject.class || undefined}
                                  onChange={value => {
                                    if (value) {
                                      updateField(
                                        "class",
                                        value as ProjectClass
                                      );
                                    }
                                  }}
                                  data={[
                                    {
                                      value: "STANDARD",
                                      label: t("form.classOptions.standard")
                                    },
                                    {
                                      value: "COMFORT",
                                      label: t("form.classOptions.comfort")
                                    },
                                    {
                                      value: "BUSINESS",
                                      label: t("form.classOptions.business")
                                    },
                                    {
                                      value: "PREMIUM",
                                      label: t("form.classOptions.premium")
                                    },
                                    {
                                      value: "ELITE",
                                      label: t("form.classOptions.elite")
                                    }
                                  ]}
                                  placeholder={t("form.classOptions.standard")}
                                />
                              </div>
                            </Group>
                          </Stack>
                        </SimpleGrid>
                      </Stack>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="currency">
                    <Paper p="md" mt="md">
                      <CurrencySettingsForm
                        project={editedProject}
                        onSave={handleCurrencyUpdate}
                        isSaving={loading}
                      />
                    </Paper>
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Grid.Col>

            <Grid.Col span={4}>
              <Stack>
                <Card withBorder>
                  <Stack>
                    <Group grow>
                      <NumberInput
                        label={t("form.basePrice")}
                        value={editedProject.pricing?.basePrice || 0}
                        onChange={value => {
                          if (typeof value === "number") {
                            updateField("pricing", {
                              ...editedProject.pricing,
                              basePrice: value,
                              id: editedProject.pricing?.id || "",
                              projectId: project.id,
                              createdAt:
                                editedProject.pricing?.createdAt || new Date(),
                              updatedAt: new Date(),
                              pricePerSqm:
                                editedProject.pricing?.pricePerSqm || 0,
                              currencyId:
                                editedProject.pricing?.currencyId || "THB",
                              maintenanceFee:
                                editedProject.pricing?.maintenanceFee || null,
                              maintenanceFeePeriod:
                                editedProject.pricing?.maintenanceFeePeriod ||
                                null
                            } as ProjectPricing);
                          }
                        }}
                        min={0}
                        step={1000}
                      />
                      <TextInput
                        label={t("form.currencyId")}
                        value={editedProject.pricing?.currencyId || ""}
                        onChange={e =>
                          updateField("pricing", {
                            ...editedProject.pricing,
                            currencyId: e.target.value,
                            id: editedProject.pricing?.id || "",
                            projectId: project.id,
                            createdAt:
                              editedProject.pricing?.createdAt || new Date(),
                            updatedAt: new Date(),
                            basePrice: editedProject.pricing?.basePrice || 0,
                            pricePerSqm:
                              editedProject.pricing?.pricePerSqm || 0,
                            maintenanceFee:
                              editedProject.pricing?.maintenanceFee || null,
                            maintenanceFeePeriod:
                              editedProject.pricing?.maintenanceFeePeriod ||
                              null
                          } as ProjectPricing)
                        }
                      />
                    </Group>
                    <NumberInput
                      label={t("form.pricePerSqm")}
                      value={editedProject.pricing?.pricePerSqm || 0}
                      onChange={value => {
                        if (typeof value === "number") {
                          updateField("pricing", {
                            ...editedProject.pricing,
                            pricePerSqm: value,
                            id: editedProject.pricing?.id || "",
                            projectId: project.id,
                            createdAt:
                              editedProject.pricing?.createdAt || new Date(),
                            updatedAt: new Date(),
                            basePrice: editedProject.pricing?.basePrice || 0,
                            currencyId:
                              editedProject.pricing?.currencyId || "THB",
                            maintenanceFee:
                              editedProject.pricing?.maintenanceFee || null,
                            maintenanceFeePeriod:
                              editedProject.pricing?.maintenanceFeePeriod ||
                              null
                          } as ProjectPricing);
                        }
                      }}
                      min={0}
                      step={100}
                    />
                    <Group grow>
                      <NumberInput
                        label={t("form.maintenanceFee")}
                        value={editedProject.pricing?.maintenanceFee || 0}
                        onChange={value => {
                          if (typeof value === "number") {
                            updateField("pricing", {
                              ...editedProject.pricing,
                              maintenanceFee: value,
                              id: editedProject.pricing?.id || "",
                              projectId: project.id,
                              createdAt:
                                editedProject.pricing?.createdAt || new Date(),
                              updatedAt: new Date(),
                              basePrice: editedProject.pricing?.basePrice || 0,
                              pricePerSqm:
                                editedProject.pricing?.pricePerSqm || 0,
                              currencyId:
                                editedProject.pricing?.currencyId || "THB",
                              maintenanceFeePeriod:
                                editedProject.pricing?.maintenanceFeePeriod ||
                                null
                            } as ProjectPricing);
                          }
                        }}
                        min={0}
                        step={100}
                      />
                      <Select
                        label={t("form.maintenanceFeePeriod")}
                        value={
                          editedProject.pricing?.maintenanceFeePeriod ||
                          "monthly"
                        }
                        onChange={value =>
                          updateField("pricing", {
                            ...editedProject.pricing,
                            maintenanceFeePeriod: value,
                            id: editedProject.pricing?.id || "",
                            projectId: project.id,
                            createdAt:
                              editedProject.pricing?.createdAt || new Date(),
                            updatedAt: new Date(),
                            basePrice: editedProject.pricing?.basePrice || 0,
                            pricePerSqm:
                              editedProject.pricing?.pricePerSqm || 0,
                            currencyId:
                              editedProject.pricing?.currencyId || "THB",
                            maintenanceFee:
                              editedProject.pricing?.maintenanceFee || null
                          } as ProjectPricing)
                        }
                        data={[
                          { value: "monthly", label: t("period.monthly") },
                          { value: "yearly", label: t("period.yearly") }
                        ]}
                      />
                    </Group>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>

          <Group position="right" mt="xl">
            <Button variant="light" onClick={onClose}>
              {t("form.cancel")}
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {t("form.save")}
            </Button>
          </Group>
        </Container>
      </Box>
    </Modal>
  );
}
