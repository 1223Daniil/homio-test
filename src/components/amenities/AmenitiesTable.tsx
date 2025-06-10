"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from "@heroui/react";
import {
  IconBuildingArch,
  IconBuildingBridge,
  IconBuildingCastle,
  IconBuildingChurch,
  IconBuildingCommunity,
  IconBuildingCottage,
  IconBuildingHospital,
  IconBuildingPavilion,
  IconBuildingStore,
  IconEdit,
  IconGardenCart,
  IconBarbell as IconGym,
  IconParking,
  IconBabyCarriage as IconPlayground,
  IconSwimming as IconPool,
  IconSchool,
  IconMassage as IconSpa,
  IconTrash,
  IconWifi
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { toast } from "sonner";

const availableIcons = {
  wifi: <IconWifi />,
  parking: <IconParking />,
  pool: <IconPool />,
  gym: <IconGym />,
  spa: <IconSpa />,
  garden: <IconGardenCart />,
  community: <IconBuildingCommunity />,
  store: <IconBuildingStore />,
  school: <IconSchool />,
  hospital: <IconBuildingHospital />,
  playground: <IconPlayground />,
  pavilion: <IconBuildingPavilion />,
  arch: <IconBuildingArch />,
  bridge: <IconBuildingBridge />,
  castle: <IconBuildingCastle />,
  church: <IconBuildingChurch />,
  cottage: <IconBuildingCottage />
} as const;

interface Amenity {
  id: string;
  name: string;
  description: string | null;
  icon: keyof typeof availableIcons;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  icon: keyof typeof availableIcons;
}

interface AmenitiesTableProps {
  onUpdate?: () => void;
}

export default function AmenitiesTable({ onUpdate }: AmenitiesTableProps) {
  const t = useTranslations("Amenities");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    icon: "wifi"
  });
  const locale = useLocale();

  useEffect(() => {
    if (selectedAmenity) {
      setFormData({
        name: selectedAmenity.name,
        description: selectedAmenity.description || "",
        icon: selectedAmenity.icon || "wifi"
      });
    }
  }, [selectedAmenity]);

  const fetchAmenities = useCallback(async () => {
    try {
      const response = await fetch("/api/amenities");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch amenities");
      }
      const data = await response.json();
      setAmenities(data);
      setError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching amenities:", message);
      setError(message);
      toast.error(t("errors.fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/amenities/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to delete amenity");
      }

      toast.success(t("messages.deleteSuccess"));
      fetchAmenities();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error deleting amenity:", message);
      toast.error(t("errors.deleteError"));
    }
  };

  const handleEdit = (amenity: Amenity) => {
    console.log("Editing amenity:", amenity);
    setSelectedAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description || "",
      icon: amenity.icon || "wifi"
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/amenities/${selectedAmenity?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update amenity");
      }

      toast.success(t("messages.updateSuccess"));
      onClose();
      fetchAmenities();
      if (onUpdate) onUpdate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error updating amenity:", message);
      toast.error(t("errors.updateError"));
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return (
      <div className="text-danger">
        <p>{t("errors.fetchError")}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Table aria-label={t("table.ariaLabel")}>
        <TableHeader>
          <TableColumn>{t("table.0.label")}</TableColumn>
          <TableColumn>{t("table.1.label")}</TableColumn>
          <TableColumn>{t("table.2.label")}</TableColumn>
          <TableColumn>{t("table.3.label")}</TableColumn>
          <TableColumn>{t("table.4.label")}</TableColumn>
        </TableHeader>
        <TableBody>
          {amenities.map(amenity => {
            console.log("amenity", amenity);
            return (
              <TableRow key={amenity.id}>
                <TableCell>
                  {availableIcons[amenity.icon] || availableIcons.wifi}
                </TableCell>
                <TableCell>
                  {amenity.translations.length
                    ? amenity.translations.find(t => t.locale === locale)?.name
                    : amenity.name}
                </TableCell>
                <TableCell>
                  {amenity.translations.length
                    ? amenity.translations.find(t => t.locale === locale)
                        ?.description
                    : amenity.description}
                </TableCell>
                <TableCell>
                  {new Date(amenity.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      onPress={() => handleEdit(amenity)}
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleDelete(amenity.id)}
                    >
                      <IconTrash size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{t("form.editAmenity")}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label={t("form.name")}
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label={t("form.description")}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Select
                label={t("form.icon")}
                selectedKeys={[formData.icon]}
                startContent={availableIcons[formData.icon]}
                onChange={e => {
                  const value = e.target.value;
                  if (Object.keys(availableIcons).includes(value)) {
                    setFormData({
                      ...formData,
                      icon: value as keyof typeof availableIcons
                    });
                  }
                }}
              >
                {Object.entries(availableIcons).map(([key, icon]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="capitalize">{key}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              {t("form.cancel")}
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {t("form.update")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
