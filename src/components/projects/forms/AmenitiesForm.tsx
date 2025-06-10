"use client";

import { Amenity, ProjectAmenity } from "@prisma/client";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { toast } from "sonner";

interface AmenitiesFormProps {
  projectId: string;
  amenities: (ProjectAmenity & { amenity: Amenity })[];
  onUpdate: () => void;
  onSave?: (data: { amenities: string[] }) => Promise<void>;
  isSaving?: boolean;
}

export function AmenitiesForm({
  projectId,
  amenities,
  onUpdate,
  onSave,
  isSaving
}: AmenitiesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    amenities.map(a => a.amenityId)
  );

  const t = useTranslations("Projects.amenities");
  const locale = useLocale();

  useEffect(() => {
    // Update selected amenities when the amenities prop changes
    setSelectedAmenities(amenities.map(a => a.amenityId));
  }, [amenities]);

  useEffect(() => {
    // Загружаем список доступных удобств
    const fetchAmenities = async () => {
      try {
        const response = await fetch("/api/amenities");
        if (!response.ok) throw new Error("Failed to fetch amenities");
        const data = await response.json();
        console.log("data", data);
        setAvailableAmenities(data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        toast.error("Failed to load amenities");
      }
    };

    fetchAmenities();
  }, []);

  const handleAddAmenity = async () => {
    if (!selectedAmenityId) {
      toast.error("Please select an amenity");
      return;
    }

    const newAmenities = [...selectedAmenities, selectedAmenityId];
    setSelectedAmenities(newAmenities);
    setSelectedAmenityId("");

    if (onSave) {
      try {
        await onSave({ amenities: newAmenities });
      } catch (error) {
        console.error("Error adding amenity:", error);
        toast.error(t("errors.createError"));
        // Revert the change if saving failed
        setSelectedAmenities(selectedAmenities);
      }
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    const newAmenities = selectedAmenities.filter(id => id !== amenityId);
    setSelectedAmenities(newAmenities);

    if (onSave) {
      try {
        await onSave({ amenities: newAmenities });
        toast.success("Amenity deleted successfully");
      } catch (error) {
        console.error("Error deleting amenity:", error);
        toast.error("Failed to delete amenity");
        // Revert the change if saving failed
        setSelectedAmenities(selectedAmenities);
      }
    }
  };

  // Фильтруем доступные удобства, исключая уже добавленные
  const filteredAmenities = availableAmenities.filter(
    amenity => !selectedAmenities.includes(amenity.id)
  );

  return (
    <div className="space-y-6">
      {/* Existing Amenities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {amenities.map(amenity => (
          <div
            key={amenity.id}
            className="p-4 border border-default-200 rounded-lg flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                {amenity.amenity.translations.length
                  ? amenity.amenity.translations.find(t => t.locale === locale)
                      ?.name
                  : amenity.amenity.name || t("untitled")}
              </div>
              {amenity?.amenity?.description && (
                <div className="text-sm text-default-500">
                  {amenity.amenity.translations.length
                    ? amenity.amenity.translations.find(
                        t => t.locale === locale
                      )?.description
                    : amenity.amenity.description}
                </div>
              )}
            </div>
            <Button
              isIconOnly
              color="danger"
              variant="light"
              onPress={() => handleDeleteAmenity(amenity.amenityId)}
              isDisabled={isSaving}
            >
              <IconTrash size={18} />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Amenity Form */}
      <div className="border-t border-default-200 pt-6">
        <h3 className="text-lg font-medium mb-4">
          {t("Forms.amenities.add.title")}
        </h3>
        <div className="flex gap-4">
          <Select
            label={t("Forms.fields.amenity.label")}
            placeholder={t("Forms.fields.amenity.hint")}
            selectedKeys={selectedAmenityId ? [selectedAmenityId] : []}
            onSelectionChange={keys => {
              const key = Array.from(keys)[0]?.toString();
              setSelectedAmenityId(key || "");
            }}
            className="flex-1"
            isDisabled={isSaving}
          >
            {filteredAmenities.map(amenity => (
              <SelectItem key={amenity.id} value={amenity.id}>
                {amenity.translations.length
                  ? amenity.translations.find(t => t.locale === locale)?.name
                  : amenity.name}
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={handleAddAmenity}
            isLoading={isLoading}
            isDisabled={isSaving || !selectedAmenityId}
          >
            {t("Form.add.amenity")}
          </Button>
        </div>
      </div>
    </div>
  );
}
