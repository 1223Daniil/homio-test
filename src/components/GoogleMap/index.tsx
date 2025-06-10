"use client";

import { useEffect, useMemo, useState } from "react";

import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/utils/googleMaps";
// Используем dynamic импорт с правильной типизацией
import dynamic from "next/dynamic";

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

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "100%"
};

export default function Map({ center, zoom = 12 }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  // Детектируем клиентскую сторону
  useEffect(() => {
    setIsClient(true);
  }, []);

  const centerPosition = useMemo(() => center, [center]);

  // Защищаемся от ошибок SSR
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Инициализация карты...</div>
      </div>
    );
  }

  return (
    <GoogleMapWithNoSSR
      mapContainerStyle={containerStyle}
      center={centerPosition}
      zoom={zoom}
      options={{
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      }}
    >
      <MarkerWithNoSSR position={centerPosition} />
    </GoogleMapWithNoSSR>
  );
}
