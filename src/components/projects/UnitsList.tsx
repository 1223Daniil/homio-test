"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  Group,
  Text,
  Select,
  TextInput,
  ActionIcon,
  Badge,
  Paper,
  Button,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Card,
  Stack
} from "@mantine/core";
import {
  IconEdit,
  IconEye,
  IconLayoutGrid,
  IconTable
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface Unit {
  id: string;
  title: string;
  description?: string;
  floor: number;
  unitNumber?: string;
  area?: number;
  price?: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  projectId: string;
}

interface UnitsListProps {
  projectId: string;
  onViewUnit: (unit: Unit) => void;
  onEditUnit: (unit: Unit) => void;
}

export function UnitsList({
  projectId,
  onViewUnit,
  onEditUnit
}: UnitsListProps) {
  const t = useTranslations("Projects.units");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState({
    status: "all",
    search: ""
  });

  useEffect(() => {
    fetchUnits();
  }, [projectId]);

  const fetchUnits = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/units`);
      if (!response.ok) throw new Error("Failed to fetch units");
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      notifications.show({
        title: t("error.title"),
        message: t("error.message"),
        color: "red"
      });
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Unit["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "green";
      case "RESERVED":
        return "yellow";
      case "SOLD":
        return "red";
      default:
        return "gray";
    }
  };

  const filteredUnits = units.filter(unit => {
    if (filters.status !== "all" && unit.status !== filters.status)
      return false;
    if (
      filters.search &&
      !unit.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return <Text>{t("loading")}</Text>;
  }

  const renderTableView = () => (
    <ScrollArea>
      {filteredUnits.length > 0 ? (
        <table className="mantine-table">
          <thead>
            <tr>
              <th>{t("title")}</th>
              <th>{t("unitNumber")}</th>
              <th>{t("floor")}</th>
              <th>{t("area")}</th>
              <th>{t("price")}</th>
              <th>{t("status")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map(unit => (
              <tr key={unit.id}>
                <td>{unit.title}</td>
                <td>{unit.unitNumber || "-"}</td>
                <td>{unit.floor}</td>
                <td>{unit.area ? `${unit.area} m²` : "-"}</td>
                <td>{unit.price ? `$${unit.price.toLocaleString()}` : "-"}</td>
                <td>
                  <Badge color={getStatusColor(unit.status)}>
                    {t(`status.${unit.status}`)}
                  </Badge>
                </td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      onClick={() => onViewUnit(unit)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      onClick={() => onEditUnit(unit)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Text align="center" mt="md">
          {t("noUnits")}
        </Text>
      )}
    </ScrollArea>
  );

  const renderGridView = () => (
    <SimpleGrid cols={3} spacing="lg">
      {filteredUnits.map(unit => (
        <Card key={unit.id} shadow="sm" padding="lg" radius="md" withBorder>
          <Stack spacing="md">
            <Group position="apart" align="flex-start">
              <Stack spacing={4}>
                <Text fw={500} size="lg" style={{ lineHeight: 1.2 }}>
                  {unit.title}
                </Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.2 }}>
                  {t("unitNumber")}: {unit.unitNumber || "-"}
                </Text>
              </Stack>
              <Badge
                color={getStatusColor(unit.status)}
                size="lg"
                variant="light"
              >
                {t(`status.${unit.status}`)}
              </Badge>
            </Group>

            <Stack spacing="xs">
              <Group spacing="lg">
                <Text size="sm">
                  <Text span fw={500}>
                    {t("floor")}:
                  </Text>{" "}
                  {unit.floor}
                </Text>
                {unit.area && (
                  <Text size="sm">
                    <Text span fw={500}>
                      {t("area")}:
                    </Text>{" "}
                    {unit.area} m²
                  </Text>
                )}
              </Group>
              {unit.price && (
                <Text size="lg" fw={700} c="blue.6">
                  ${unit.price.toLocaleString()}
                </Text>
              )}
            </Stack>

            <Group spacing="xs" mt="auto">
              <Button
                variant="light"
                size="sm"
                leftIcon={<IconEye size={16} />}
                onClick={() => onViewUnit(unit)}
                fullWidth
              >
                {t("view")}
              </Button>
              <Button
                variant="light"
                size="sm"
                leftIcon={<IconEdit size={16} />}
                onClick={() => onEditUnit(unit)}
                fullWidth
              >
                {t("edit")}
              </Button>
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );

  return (
    <Paper p="md">
      <Group mb="md" position="apart">
        <Group>
          <Select
            size="sm"
            value={filters.status}
            onChange={value =>
              setFilters({ ...filters, status: value || "all" })
            }
            data={[
              { value: "all", label: t("filters.allStatuses") },
              { value: "AVAILABLE", label: t("status.AVAILABLE") },
              { value: "RESERVED", label: t("status.RESERVED") },
              { value: "SOLD", label: t("status.SOLD") }
            ]}
            placeholder={t("filters.selectStatus")}
          />
          <TextInput
            size="sm"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            placeholder={t("search")}
          />
        </Group>
        <Group>
          <SegmentedControl
            size="sm"
            value={viewMode}
            onChange={(value: "table" | "grid") => setViewMode(value)}
            data={[
              {
                value: "table",
                label: (
                  <Group spacing={4}>
                    <IconTable size={16} />
                    <Text size="sm">{t("views.table")}</Text>
                  </Group>
                )
              },
              {
                value: "grid",
                label: (
                  <Group spacing={4}>
                    <IconLayoutGrid size={16} />
                    <Text size="sm">{t("views.grid")}</Text>
                  </Group>
                )
              }
            ]}
          />
          <Button>{t("addUnit")}</Button>
        </Group>
      </Group>

      {viewMode === "table" ? renderTableView() : renderGridView()}
    </Paper>
  );
}
