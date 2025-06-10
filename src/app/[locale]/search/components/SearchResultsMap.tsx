"use client";

import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_OPTIONS
} from "@/utils/googleMaps";
import { useEffect, useRef } from "react";

import { Loader } from "@googlemaps/js-api-loader";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "unit" | "project";
}

interface SearchResultsMapProps {
  markers: MapMarker[];
  activeType: "unit" | "project" | "all";
}

export function SearchResultsMap({
  markers,
  activeType
}: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          ...GOOGLE_MAPS_LOADER_OPTIONS,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly"
        });

        const google = await loader.load();
        console.log("Google Maps loaded successfully");

        if (mapRef.current && !googleMapRef.current) {
          googleMapRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: 7.8969, lng: 98.3033 }, // Phuket coordinates
            zoom: 10
          });
          console.log("Map initialized");
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!googleMapRef.current) {
      console.log("Map not initialized yet");
      return;
    }

    console.log("Markers to display:", markers);

    try {
      // Очищаем существующие маркеры
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Создаем новые маркеры
      const bounds = new google.maps.LatLngBounds();

      markers.forEach(marker => {
        console.log("Creating marker:", marker);

        // Проверяем координаты
        if (isNaN(marker.lat) || isNaN(marker.lng)) {
          console.error("Invalid coordinates for marker:", marker);
          return;
        }

        const newMarker = new google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: googleMapRef.current,
          title: marker.title
          // Временно уберем кастомные иконки для проверки
          // icon: {
          //   url: marker.type === 'unit' ? '/unit-marker.png' : '/project-marker.png',
          //   scaledSize: new google.maps.Size(32, 32),
          // },
        });

        console.log("Marker created:", newMarker);

        markersRef.current.push(newMarker);
        bounds.extend(newMarker.getPosition()!);
      });

      // Центрируем карту на маркерах
      if (markers.length > 0) {
        googleMapRef.current.fitBounds(bounds);
        google.maps.event.addListenerOnce(
          googleMapRef.current,
          "bounds_changed",
          () => {
            if (googleMapRef.current!.getZoom()! > 13) {
              googleMapRef.current!.setZoom(13);
            }
          }
        );
        console.log("Map bounds updated");
      }
    } catch (error) {
      console.error("Error creating markers:", error);
    }
  }, [markers, activeType]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden mt-4">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
