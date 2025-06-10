"use client";

import { Card, CardBody } from "@heroui/react";
import { GOOGLE_MAPS_LOADER_OPTIONS, formatAddress } from "@/utils/googleMaps";
import {
  IconBeach,
  IconBus,
  IconCash,
  IconMapPin,
  IconSchool,
  IconShield,
  IconSun,
  IconVolume
} from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";

import { LocationAssessment } from "@/types/project";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

// Компоненты с ленивой загрузкой
const GoogleMapWithNoSSR = dynamic(
  () => import("@react-google-maps/api").then(mod => mod.GoogleMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-500">Загрузка карты...</div>
      </div>
    )
  }
);

const MarkerWithNoSSR = dynamic(
  () => import("@react-google-maps/api").then(mod => mod.Marker),
  { ssr: false }
);

const CircleWithNoSSR = dynamic(
  () => import("@react-google-maps/api").then(mod => mod.Circle),
  { ssr: false }
);

interface LocationAssessmentMapProps {
  latitude: number;
  longitude: number;
  address: string;
  assessment: LocationAssessment;
}

const THEME = {
  primary: "rgb(0, 145, 255)",
  primaryBg: "bg-primary/5",
  primaryText: "text-primary",
  primaryBorder: "border-primary/10"
};

function RatingCircle({
  value,
  maxValue,
  icon
}: {
  value: number;
  maxValue: number;
  icon: React.ReactElement<{ className: string }>;
}) {
  const percentage = ((value || 0) / maxValue) * 100;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Определяем цвет в зависимости от значения (светофор)
  const getStrokeColor = (value: number) => {
    if (value >= 7) return "rgb(34, 197, 94)"; // зеленый
    if (value >= 4) return "rgb(234, 179, 8)"; // желтый
    return "rgb(239, 68, 68)"; // красный
  };

  const strokeColor = getStrokeColor(value || 0);

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#E4E4E7"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke={strokeColor}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
    </div>
  );
}

// Компонент статической карты для отображения вместо Google Maps
function StaticMapPlaceholder({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <CardBody className="p-0 flex flex-col items-center justify-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <IconMapPin size={40} className="text-primary" />
        </div>
        <p className="text-default-600 mb-2 text-center px-4">
          Google Maps не может быть загружен из-за настроек безопасности.
        </p>
        <p className="text-sm text-default-500 mb-4">
          Координаты: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
        <div className="mt-2">
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Открыть в Google Maps
          </a>
        </div>
      </CardBody>
    </Card>
  );
}

export function LocationAssessmentMap({
  latitude,
  longitude,
  address,
  assessment
}: LocationAssessmentMapProps) {
  const t = useTranslations("Projects");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const [isClient, setIsClient] = useState(false);

  // Используем useJsApiLoader с общими настройками
  const { isLoaded, loadError } = useJsApiLoader({
    ...GOOGLE_MAPS_LOADER_OPTIONS,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const [useStaticMap, setUseStaticMap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Определяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true);

    // Проверяем наличие ошибок при загрузке Google Maps API
    if (loadError) {
      console.error("Google Maps API loading error:", loadError);
      setUseStaticMap(true);
      setError("Google Maps API не может быть загружен");
    }
  }, [loadError]);

  // Используем общую функцию форматирования адреса
  const formattedAddress = formatAddress(address);

  const getDescription = (value: number | null | undefined, type: string) => {
    const numericValue = value ?? 0;
    if (numericValue >= 7)
      return t(`infrastructure.descriptions.${type}.high` as any);
    if (numericValue >= 4)
      return t(`infrastructure.descriptions.${type}.medium` as any);
    return t(`infrastructure.descriptions.${type}.low` as any);
  };

  const ratings = [
    {
      title: t("infrastructure.publicTransport" as any),
      value: assessment?.publicTransport ?? 0,
      maxValue: 10,
      icon: (<IconBus className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(
        assessment?.publicTransport,
        "publicTransport"
      )
    },
    {
      title: t("infrastructure.amenitiesLevel" as any),
      value: assessment?.amenitiesLevel ?? 0,
      maxValue: 10,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.amenitiesLevel, "amenities")
    },
    {
      title: t("infrastructure.climateConditions" as any),
      value: assessment?.climateConditions ?? 0,
      maxValue: 10,
      icon: (<IconSun className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.climateConditions, "climate")
    },
    {
      title: t("infrastructure.beachAccess" as any),
      value: assessment?.beachAccess ?? 0,
      maxValue: 10,
      icon: (<IconBeach className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.beachAccess, "beach")
    },
    {
      title: t("infrastructure.rentalDemand" as any),
      value: assessment?.rentalDemand ?? 0,
      maxValue: 10,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.rentalDemand, "rental")
    },
    {
      title: t("infrastructure.safetyLevel" as any),
      value: assessment?.safetyLevel ?? 0,
      maxValue: 10,
      icon: (
        <IconShield className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.safetyLevel, "safety")
    },
    {
      title: t("infrastructure.noiseLevel" as any),
      value: assessment?.noiseLevel ?? 0,
      maxValue: 10,
      icon: (
        <IconVolume className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.noiseLevel, "noise")
    },
    {
      title: t("infrastructure.schoolsAvailable" as any),
      value: assessment?.schoolsAvailable ?? 0,
      maxValue: 10,
      icon: (
        <IconSchool className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.schoolsAvailable, "schools")
    }
  ];

  // Если нет координат, отображаем более простой интерфейс
  if (!latitude || !longitude) {
    return (
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
          {t("infrastructure.title" as any)}
        </h2>
        <Card className="w-full">
          <CardBody className="p-6 text-center">
            <p className="text-default-600 mb-2">
              {t("infrastructure.noLocationData" as any)}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Если не на клиенте, показываем заглушку загрузки
  if (!isClient) {
    return (
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
          {t("infrastructure.title" as any)}
        </h2>
        <div className="flex items-center gap-2 text-default-500 mb-8">
          <IconMapPin size={18} className="text-[#0091FF]" />
          <span>{formattedAddress}</span>
        </div>
        <Card className="h-[400px] w-full">
          <CardBody className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-default-600 mb-2">Загрузка карты...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardBody className="p-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
            {t("infrastructure.title" as any)}
          </h3>

          {/* Карта */}
          <div className="w-full h-[400px] mb-6">
            {isClient && isLoaded && !loadError && !useStaticMap ? (
              <GoogleMapWithNoSSR
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: latitude, lng: longitude }}
                zoom={12}
              >
                <MarkerWithNoSSR
                  position={{ lat: latitude, lng: longitude }}
                  draggable={true}
                />
                <CircleWithNoSSR
                  center={{ lat: latitude, lng: longitude }}
                  options={{
                    strokeColor: "#0075FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#0075FF",
                    fillOpacity: 0.2,
                    clickable: false,
                    draggable: false,
                    editable: false,
                    visible: true,
                    radius: 500,
                    zIndex: 1
                  }}
                />
              </GoogleMapWithNoSSR>
            ) : (
              <StaticMapPlaceholder latitude={latitude} longitude={longitude} />
            )}
          </div>

          {/* Адрес */}
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconMapPin className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-default-900 mb-1">
                {t("infrastructure.address" as any)}
              </h4>
              <p className="text-default-600">{formattedAddress}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratings.map((rating, index) => (
                <div
                  key={index}
                  className="bg-[#FFFFFF] dark:bg-[#1F1F1F] rounded-xl p-6 flex items-start gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
                >
                  <RatingCircle
                    value={rating.value}
                    maxValue={rating.maxValue}
                    icon={rating.icon}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold leading-tight max-w-[70%]">
                        {rating.title}
                      </h4>
                      <span className="text-sm font-medium text-default-900">
                        {rating.value}/{rating.maxValue}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {rating.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
