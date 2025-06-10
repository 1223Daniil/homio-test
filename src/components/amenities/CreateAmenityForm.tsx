"use client";

import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
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
  IconGardenCart,
  IconBarbell as IconGym,
  IconParking,
  IconBabyCarriage as IconPlayground,
  IconSwimming as IconPool,
  IconSchool,
  IconMassage as IconSpa,
  IconWifi
} from "@tabler/icons-react";

import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";

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

interface CreateAmenityFormProps {
  onSuccess?: () => void;
}

export default function CreateAmenityForm({
  onSuccess
}: CreateAmenityFormProps) {
  const t = useTranslations("Amenities");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "wifi" as keyof typeof availableIcons
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/amenities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to create amenity");
      }

      toast.success(t("messages.createSuccess"));
      setFormData({ name: "", description: "", icon: "wifi" });
      onSuccess?.();
    } catch (error) {
      console.error("Error creating amenity:", error);
      toast.error(t("errors.createError"));
    } finally {
      setIsLoading(false);
    }
  };

  console.log(formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t("form.name")}
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
        isDisabled={isLoading}
      />

      <Textarea
        label={t("form.description")}
        value={formData.description}
        onChange={e =>
          setFormData(prev => ({ ...prev, description: e.target.value }))
        }
        isDisabled={isLoading}
      />

      <Select
        label={t("form.icon")}
        defaultSelectedKeys={["wifi"]}
        selectedKeys={[formData.icon]}
        startContent={availableIcons[formData.icon]}
        onChange={e => {
          const value = e.target.value;
          if (Object.keys(availableIcons).includes(value)) {
            setFormData(prev => ({
              ...prev,
              icon: value as keyof typeof availableIcons
            }));
          }
        }}
        isDisabled={isLoading}
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

      <div className="flex justify-end">
        <Button
          type="submit"
          color="secondary"
          variant="solid"
          isLoading={isLoading}
        >
          {t("form.create")}
        </Button>
      </div>
    </form>
  );
}
