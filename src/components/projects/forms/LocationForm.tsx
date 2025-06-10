"use client";

import { Autocomplete } from "@react-google-maps/api";
import { Button, Input, Spinner } from "@heroui/react";
import { useMemo, useRef, useState, useEffect } from "react";

import { ProjectLocationMap } from "@/components/maps/ProjectLocationMap";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useJsApiLoader } from "@react-google-maps/api";
import { 
  GOOGLE_MAPS_LIBRARIES, 
  DEFAULT_COORDINATES,
  GOOGLE_MAPS_LOADER_OPTIONS
} from "@/utils/googleMaps";

// Значения по умолчанию для координат (Москва)
const DEFAULT_LATITUDE = DEFAULT_COORDINATES.LATITUDE;
const DEFAULT_LONGITUDE = DEFAULT_COORDINATES.LONGITUDE;

interface LocationFormProps {
  project: {
    id: string;
    location?: {
      id: string;
      address: string;
      city: string;
      country: string;
      district: string;
      latitude: number;
      longitude: number;
      beachDistance: number | null;
      centerDistance: number | null;
    };
  };
  onSave: (data: { location: any }) => Promise<void>;
  isSaving: boolean;
}

interface LocationFormData {
  country: string | undefined;
  city: string | undefined;
  district: string | undefined;
  address: string | undefined;
  latitude: number;
  longitude: number;
  beachDistance: number;
  centerDistance: number;
}

export function LocationForm({ project, onSave, isSaving }: LocationFormProps) {
  const t = useTranslations("Projects");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const params = useParams();
  
  // Используем useJsApiLoader с общими настройками
  const { isLoaded, loadError } = useJsApiLoader({
    ...GOOGLE_MAPS_LOADER_OPTIONS,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });

  const [formData, setFormData] = useState<LocationFormData>({
    country: project.location?.country || "",
    city: project.location?.city || "",
    district: project.location?.district || "",
    address: project.location?.address || "",
    latitude: project.location?.latitude || DEFAULT_LATITUDE,
    longitude: project.location?.longitude || DEFAULT_LONGITUDE,
    beachDistance: project.location?.beachDistance || 0,
    centerDistance: project.location?.centerDistance || 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LocationFormData>();

  const [mapCenter, setMapCenter] = useState({
    lat: project.location?.latitude || DEFAULT_LATITUDE,
    lng: project.location?.longitude || DEFAULT_LONGITUDE
  });

  const updateFormFields = (data: Partial<LocationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();

    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const formattedAddress = place.formatted_address || "";

      let locationData = {
        address: formattedAddress,
        latitude: lat,
        longitude: lng,
        country: formData.country,
        city: formData.city,
        district: formData.district
      };

      place.address_components?.forEach(component => {
        const types = component.types;
        const name = component.long_name;

        if (types.includes("country")) {
          locationData.country = name;
        }
        if (types.includes("administrative_area_level_1")) {
          locationData.city = name;
        }
        if (
          types.includes("sublocality") ||
          types.includes("neighborhood") ||
          types.includes("administrative_area_level_2")
        ) {
          locationData.district = name;
        }
      });

      updateFormFields(locationData);
      setMapCenter({ lat, lng });
    }
  };

  const handleMapClick = (location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    country?: string;
    district?: string;
  }) => {
    updateFormFields({
      latitude: location.lat,
      longitude: location.lng,
      ...(location.address && { address: location.address }),
      ...(location.city && { city: location.city }),
      ...(location.country && { country: location.country }),
      ...(location.district && { district: location.district })
    });
  };

  const onSubmit = async (data: LocationFormData) => {
    try {
      const dataToUpdate = {
        location: {
          ...(project.location?.id && { id: project.location.id }),
          country: data.country,
          city: data.city,
          district: data.district,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          beachDistance: Number(data.beachDistance) || null,
          centerDistance: Number(data.centerDistance) || null,
          projectId: project.id
        }
      };

      console.log("dataToUpdate", dataToUpdate);

      await onSave(dataToUpdate);
    } catch (error) {
      console.error("Location update error:", {
        error,
        projectId: project.id,
        context: "location_form_submit"
      });
      toast.error(t("errors.locationUpdateFailed"));
    }
  };

  // Показываем индикатор загрузки, пока Google Maps API не загрузится
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-60">
        <Spinner size="lg" />
        <span className="ml-2">Загрузка...</span>
      </div>
    );
  }

  // Показываем сообщение об ошибке, если не удалось загрузить Google Maps API
  if (loadError) {
    return (
      <div className="p-4 border border-danger rounded-lg text-danger">
        <p>Не удалось загрузить Google Maps API</p>
        <p className="text-sm mt-2">{loadError.message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(() => onSubmit(formData))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <Autocomplete
            onLoad={autocomplete => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handlePlaceSelect}
          >
            <Input
              label={t("location.address")}
              value={formData.address || ""}
              onChange={e => updateFormFields({ address: e.target.value })}
              isDisabled={isSaving}
              classNames={{
                input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
              }}
            />
          </Autocomplete>
        </div>

        <Input
          label={t("location.country")}
          value={formData.country || ""}
          onChange={e => updateFormFields({ country: e.target.value })}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
          }}
        />

        <Input
          label={t("location.city")}
          value={formData.city || ""}
          onChange={e => updateFormFields({ city: e.target.value })}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
          }}
        />

        <Input
          label={t("location.district")}
          value={formData.district || ""}
          onChange={e => updateFormFields({ district: e.target.value })}
          errorMessage={errors.district ? "Обязательное поле" : undefined}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
          }}
          placeholder={t("location.districtPlaceholder")}
        />

        <Input
          type="number"
          label={t("location.beachDistance")}
          value={formData.beachDistance.toString()}
          onChange={e =>
            updateFormFields({ beachDistance: Number(e.target.value) })
          }
          errorMessage={errors.beachDistance ? "Некорректное значение" : undefined}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
          }}
        />

        <Input
          type="number"
          label={t("location.centerDistance")}
          value={formData.centerDistance.toString()}
          onChange={e =>
            updateFormFields({ centerDistance: Number(e.target.value) })
          }
          errorMessage={errors.centerDistance ? "Некорректное значение" : undefined}
          isDisabled={isSaving}
          classNames={{
            input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
            inputWrapper: `bg-[#F5F5F7] dark:bg-[#2C2C2C] ${isSaving ? "opacity-50" : ""}`
          }}
        />
      </div>

      <div className="mt-6">
        <ProjectLocationMap
          defaultCenter={{
            lat: project.location?.latitude || DEFAULT_LATITUDE,
            lng: project.location?.longitude || DEFAULT_LONGITUDE
          }}
          center={mapCenter}
          onLocationSelect={handleMapClick}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
        <Button
          color="primary"
          type="submit"
          isLoading={isSaving}
          isDisabled={isSaving}
          className="px-8"
        >
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
