"use client";

import { Card, CardBody } from "@heroui/react";
// Импортируем компоненты @react-google-maps/api напрямую
import {
  Circle,
  DirectionsRenderer,
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/utils/googleMaps";
import { HiOutlineLocationMarker } from "react-icons/hi";
// Импортируем нужные иконки напрямую
import MapFilters from "@/shared/components/MapFilters";
// Удаляем неправильный импорт иконок
import type { PlacesResponse } from "@/types/places";
import { TbLocation } from "react-icons/tb";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

interface InfrastructureMapProps {
  latitude: number;
  longitude: number;
  address: string;
  beachDistance?: number;
  assessment?: any;
}

interface AreaRating {
  title: string;
  value: number;
  maxValue: number;
  icon: React.ReactElement<{ className: string }>;
  description: string;
}

interface PlaceDetails {
  transitStations: number;
  amenities: number;
  beaches: number;
  schools: number;
  crimeRate: number;
  noiseLevel: number;
  rentalDemand: number;
  weatherConditions: number;
}

interface RatingCalculation {
  calculateScore: (data: any) => number;
  getDescription: (score: number) => string;
}

interface Rating {
  title: string;
  value: number;
  maxValue: number;
  icon: React.ReactElement;
  description: string;
}

interface TransitData {
  results?: google.maps.places.PlaceResult[];
}

interface AmenitiesData {
  results?: google.maps.places.PlaceResult[];
}

interface SchoolsData {
  results?: google.maps.places.PlaceResult[];
}

const THEME = {
  primary: "rgb(0, 145, 255)",
  primaryBg: "bg-primary/5",
  veryLow: "text-[#F04438]",
  veryLowBg: "bg-[#F04438]",
  middle: "text-[#FEC84B]",
  middleBg: "bg-[#FEC84B]",
  high: "text-[#12B76A]",
  highBg: "bg-[#12B76A]",
  primaryText: "text-primary",
  primaryBorder: "border-primary/10"
};

const mapContainerStyle = {
  width: "100%",
  height: "100%"
};

const circleOptions = {
  strokeColor: "rgb(0, 145, 255)",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "rgb(0, 145, 255)",
  fillOpacity: 0.2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 500,
  zIndex: 1
};

const markerIcon = {
  path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
  fillColor: "rgb(0, 145, 255)",
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#FFFFFF",
  scale: 0.5
};

const ratingCalculations: Record<string, RatingCalculation> = {
  transit: {
    calculateScore: (data: any) => {
      const stations = data.results.length;
      if (stations >= 5) return 5;
      if (stations >= 3) return 4;
      if (stations >= 2) return 3;
      if (stations >= 1) return 2;
      return 1;
    },
    getDescription: (score: number) => {
      const descriptions: { [key: number]: string } = {
        1: "Limited public transport",
        2: "Basic connectivity",
        3: "Average connectivity",
        4: "Good transport links",
        5: "Excellent transport hub"
      };
      return descriptions[score] || "No data available";
    }
  },
  amenities: {
    calculateScore: (data: any) => {
      const places = data.results.length;
      if (places >= 20) return 5;
      if (places >= 15) return 4;
      if (places >= 10) return 3;
      if (places >= 5) return 2;
      return 1;
    },
    getDescription: (score: number) => {
      const descriptions = {
        1: "Limited amenities nearby",
        2: "Basic amenities available",
        3: "Good variety of amenities",
        4: "Many amenities nearby",
        5: "Excellent amenities selection"
      };
      return (
        descriptions[score as keyof typeof descriptions] || "No data available"
      );
    }
  },
  beach: {
    calculateScore: (data: any) => {
      const beaches = data.results.filter(
        (place: any) =>
          place.types.includes("natural_feature") &&
          place.name.toLowerCase().includes("beach")
      ).length;

      if (beaches >= 3) return 5;
      if (beaches >= 2) return 4;
      if (beaches >= 1) return 3;
      return 2;
    },
    getDescription: (score: number) => {
      const descriptions = {
        2: "Beach within driving distance",
        3: "Beach within walking distance",
        4: "Multiple beaches nearby",
        5: "Prime beach location"
      };
      return (
        descriptions[score as keyof typeof descriptions] || "No data available"
      );
    }
  },
  schools: {
    calculateScore: (data: any) => {
      const schools = data.results.length;
      if (schools >= 5) return 5;
      if (schools >= 3) return 4;
      if (schools >= 2) return 3;
      if (schools >= 1) return 2;
      return 1;
    },
    getDescription: (score: number) => {
      const descriptions = {
        1: "Limited educational facilities",
        2: "Basic school access",
        3: "Good school options",
        4: "Multiple quality schools",
        5: "Excellent educational hub"
      };
      return (
        descriptions[score as keyof typeof descriptions] || "No data available"
      );
    }
  }
};

const getStrokeColor = (value: number) => {
  if (value >= 7) return "rgb(34, 197, 94)"; // зеленый
  if (value >= 4) return "rgb(234, 179, 8)"; // желтый
  return "rgb(239, 68, 68)"; // красный
};

// Добавим компонент для кругового индикатора
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

  const strokeColor = getStrokeColor(value || 0);

  return (
    <div className="relative w-16 h-16 hidden md:block">
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

export default function InfrastructureMap({
  latitude,
  longitude,
  address,
  beachDistance,
  assessment
}: InfrastructureMapProps) {
  const t = useTranslations("ProjectDetails");
  const tProject = useTranslations("Projects");
  const [isClient, setIsClient] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeFilters, setActiveFilters] = useState<number[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [useStaticMap, setUseStaticMap] = useState(false);

  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);

  console.log("assessment", assessment);

  const center = useMemo(
    () => ({
      lat: latitude,
      lng: longitude
    }),
    [latitude, longitude]
  );

  const getDescription = (value: number | null | undefined, type: string) => {
    const numericValue = value ?? 0;
    if (numericValue >= 7)
      return tProject(`infrastructure.descriptions.${type}.high` as any);
    if (numericValue >= 4)
      return tProject(`infrastructure.descriptions.${type}.medium` as any);
    return tProject(`infrastructure.descriptions.${type}.low` as any);
  };

  const ratings = [
    {
      title: tProject("infrastructure.publicTransport" as any),
      value: assessment?.publicTransport ?? 0,
      maxValue: 10,
      icon: (
        <IconBus
          className={
            assessment?.publicTransport < 3
              ? THEME.veryLow
              : assessment?.publicTransport < 6
                ? THEME.middle
                : THEME.high
          }
        />
      ) as React.ReactElement,
      description: getDescription(
        assessment?.publicTransport,
        "publicTransport"
      )
    },
    {
      title: tProject("infrastructure.amenitiesLevel" as any),
      value: assessment?.amenitiesLevel ?? 0,
      maxValue: 10,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.amenitiesLevel, "amenities")
    },
    {
      title: tProject("infrastructure.climateConditions" as any),
      value: assessment?.climateConditions ?? 0,
      maxValue: 10,
      icon: (<IconSun className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.climateConditions, "climate")
    },
    {
      title: tProject("infrastructure.beachAccess" as any),
      value: assessment?.beachAccess ?? 0,
      maxValue: 10,
      icon: (<IconBeach className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.beachAccess, "beach")
    },
    {
      title: tProject("infrastructure.rentalDemand" as any),
      value: assessment?.rentalDemand ?? 0,
      maxValue: 10,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: getDescription(assessment?.rentalDemand, "rental")
    },
    {
      title: tProject("infrastructure.safetyLevel" as any),
      value: assessment?.safetyLevel ?? 0,
      maxValue: 10,
      icon: (
        <IconShield className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.safetyLevel, "safety")
    },
    {
      title: tProject("infrastructure.noiseLevel" as any),
      value: assessment?.noiseLevel ?? 0,
      maxValue: 10,
      icon: (
        <IconVolume className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.noiseLevel, "noise")
    },
    {
      title: tProject("infrastructure.schoolsAvailable" as any),
      value: assessment?.schoolsAvailable ?? 0,
      maxValue: 10,
      icon: (
        <IconSchool className={THEME.primaryText} />
      ) as React.ReactElement,
      description: getDescription(assessment?.schoolsAvailable, "schools")
    }
  ];

  // Состояние для хранения загрузки API
  const { isLoaded, loadError } = useJsApiLoader({
    ...GOOGLE_MAPS_LOADER_OPTIONS,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    // Добавляем приоритеты загрузки
    loadingElement: <div>Загрузка карты...</div>,
    onLoad: () => console.log("Google Maps API загружен успешно"),
    onError: error => {
      console.error("Ошибка загрузки Google Maps API:", error);
      setUseStaticMap(true);
    }
  });

  // Используем useEffect для определения, что мы на клиенте
  useEffect(() => {
    setIsClient(true);

    // Проверка API ключа Google Maps
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey || apiKey.length < 20) {
      console.error("Google Maps API ключ отсутствует или недействителен");
      setUseStaticMap(true);
    }
  }, []);

  // Добавляем мониторинг статуса загрузки Google Maps API
  useEffect(() => {
    if (isClient) {
      if (loadError) {
        console.error("Ошибка загрузки Google Maps API:", loadError);
        setUseStaticMap(true);
      } else if (!isLoaded) {
        // API не загружен, но нет ошибки - возможно, загружается
        console.log("Ожидание загрузки Google Maps API...");
      } else if (typeof window !== "undefined" && !window.google?.maps) {
        // API загружен по состоянию isLoaded, но объект google.maps недоступен
        console.error("Google Maps API не загружен корректно");
        setUseStaticMap(true);
      } else {
        // API успешно загружен
        console.log("Google Maps API успешно загружен и доступен");
      }
    }
  }, [isLoaded, loadError, isClient]);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        const fetchResults = await Promise.all([
          fetch(
            `/api/places/nearby?lat=${latitude}&lng=${longitude}&type=transit_station&radius=1000`
          ),
          fetch(
            `/api/places/nearby?lat=${latitude}&lng=${longitude}&type=establishment&radius=500`
          ),
          fetch(
            `/api/places/nearby?lat=${latitude}&lng=${longitude}&type=natural_feature&radius=2000`
          ),
          fetch(
            `/api/places/nearby?lat=${latitude}&lng=${longitude}&type=school&radius=1500`
          )
        ]);

        const results = await Promise.all(fetchResults.map(r => r.json()));
        const newRatings = calculateRatings(results, t);
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    };

    if (latitude && longitude) {
      fetchPlaceDetails();
    }
  }, [latitude, longitude]);

  // Инициализация карты
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Очистка маркеров
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [markers]);

  // Функция для получения локализованного названия типа места
  const getPlaceTypeLabel = useCallback(
    (type: string): string => {
      switch (type) {
        case "natural_feature":
          return tProject("infrastructure.filters.beaches" as any);
        case "school":
          return tProject("infrastructure.filters.schools" as any);
        case "library":
          return tProject("infrastructure.filters.libraries" as any);
        case "hospital":
          return tProject("infrastructure.filters.hospitals" as any);
        case "store":
          return tProject("infrastructure.filters.stores" as any);
        case "restaurant":
          return tProject("infrastructure.filters.restaurants" as any);
        case "pharmacy":
          return tProject("infrastructure.filters.pharmacies" as any);
        case "gym":
          return tProject("infrastructure.filters.gyms" as any);
        default:
          return type;
      }
    },
    [tProject]
  );

  // Создаем стили для скрытия всех POI на карте
  const hideAllPOIStyles = [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    }
  ];

  // Функция для получения SVG-иконки в зависимости от типа места
  const getMarkerIcon = (type: string): string => {
    // Создаем SVG-иконки для разных типов мест
    const iconColor = getMarkerColor(type);

    // Базовый SVG для маркера - круг с цветом в зависимости от типа
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="${iconColor}" stroke="white" stroke-width="2" />
      </svg>
    `;
  };

  // Обработчик изменения фильтров
  const handleFiltersChange = useCallback(
    (selectedFilters: number[]) => {
      setActiveFilters(selectedFilters);

      if (!map) return;

      // Очищаем предыдущие маркеры
      clearMarkers();

      // Применяем стили для скрытия всех POI
      map.setOptions({ styles: hideAllPOIStyles });

      // Если фильтры не выбраны, ничего не делаем
      if (selectedFilters.length === 0) {
        return;
      }

      // Показываем индикатор загрузки
      setIsLoadingPlaces(true);

      // Получаем типы мест для активных фильтров
      const placeTypes = selectedFilters
        .map(index => {
          switch (index) {
            case 0:
              return "natural_feature"; // пляжи
            case 1:
              return "school"; // школы
            case 2:
              return "library"; // библиотеки
            case 3:
              return "hospital"; // больницы
            case 4:
              return "store"; // магазины
            case 5:
              return "restaurant"; // рестораны
            case 6:
              return "pharmacy"; // аптеки
            case 7:
              return "gym"; // спортзалы
            default:
              return "";
          }
        })
        .filter(Boolean);

      // Если есть активные фильтры, показываем места
      if (placeTypes.length > 0) {
        // Создаем сервис для поиска мест
        const service = new google.maps.places.PlacesService(map);

        // Счетчик для отслеживания завершения всех запросов
        let completedRequests = 0;

        // Для каждого типа места выполняем поиск
        placeTypes.forEach(type => {
          const request = {
            location: new google.maps.LatLng(latitude, longitude),
            radius: 1000,
            type: type
          };

          service.nearbySearch(
            request,
            (
              results: google.maps.places.PlaceResult[] | null,
              status: google.maps.places.PlacesServiceStatus
            ) => {
              // Увеличиваем счетчик завершенных запросов
              completedRequests++;

              // Если все запросы завершены, скрываем индикатор загрузки
              if (completedRequests === placeTypes.length) {
                setIsLoadingPlaces(false);
              }

              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                // Добавляем маркеры для найденных мест
                results.forEach(place => {
                  if (place.geometry?.location) {
                    // Получаем SVG-иконку для маркера
                    const svgMarker = getMarkerIcon(type);

                    // Создаем маркер с кастомной SVG-иконкой
                    const marker = new google.maps.Marker({
                      map,
                      position: place.geometry.location,
                      title: place.name || "",
                      icon: {
                        url:
                          "data:image/svg+xml;charset=UTF-8," +
                          encodeURIComponent(svgMarker),
                        scaledSize: new google.maps.Size(32, 32),
                        anchor: new google.maps.Point(16, 16)
                      }
                    });

                    // Определяем типы места для отображения в инфоокне
                    const placeTypes =
                      place.types
                        ?.map(type => getPlaceTypeLabel(type))
                        .join(", ") || "";

                    // Добавляем информационное окно, которое открывается при клике на маркер
                    const infowindow = new google.maps.InfoWindow({
                      content: `
                        <div style="padding: 8px; max-width: 250px;">
                          <h3 style="font-weight: 600; margin-bottom: 5px; font-size: 16px;">${place.name}</h3>
                          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">${place.vicinity || ""}</p>
                          ${place.rating ? `<p style="font-size: 13px; margin-bottom: 5px;"><span style="background-color: #0091FF; color: white; padding: 1px 5px; border-radius: 3px;">${place.rating}</span> <span style="color: #666; font-size: 12px;">(${place.user_ratings_total || 0} отзывов)</span></p>` : ""}
                          ${placeTypes ? `<p style="font-size: 12px; color: #777; margin-bottom: 3px;">Категории: ${placeTypes}</p>` : ""}
                          ${place.business_status === "OPERATIONAL" ? '<p style="color: #4CAF50; font-size: 12px; margin-bottom: 3px;">Открыто</p>' : ""}
                          ${
                            place.photos &&
                            place.photos.length > 0 &&
                            place.photos[0]?.getUrl
                              ? `
                            <div style="margin-top: 5px; text-align: center;">
                              <img src="${place.photos[0].getUrl({ maxWidth: 180, maxHeight: 120 })}" 
                                   style="max-width: 180px; max-height: 100px; object-fit: cover; border-radius: 4px;">
                            </div>
                          `
                              : ""
                          }
                          ${place.website ? `<p style="margin-top: 5px; text-align: center;"><a href="${place.website}" target="_blank" style="color: #0091FF; text-decoration: none; font-size: 12px; display: inline-block; padding: 3px 8px; border: 1px solid #0091FF; border-radius: 4px;">Посетить сайт</a></p>` : ""}
                          <p style="font-size: 11px; color: #999; margin-top: 5px; text-align: right;">Google Maps</p>
                        </div>
                      `
                    });

                    marker.addListener("click", () => {
                      infowindow.open(map, marker);
                    });

                    // Добавляем маркер в состояние для последующей очистки
                    setMarkers(prev => [...prev, marker]);
                  }
                });
              } else if (
                status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
              ) {
                // Если нет результатов, показываем уведомление
                console.log(`Не найдены места типа: ${type}`);
              } else {
                // В случае ошибки выводим в консоль
                console.error(`Ошибка при поиске мест типа ${type}: ${status}`);
              }
            }
          );
        });
      } else {
        // Если нет активных фильтров, скрываем индикатор загрузки
        setIsLoadingPlaces(false);
      }
    },
    [map, latitude, longitude, clearMarkers, getPlaceTypeLabel]
  );

  // Функция для получения цвета маркера в зависимости от типа места
  const getMarkerColor = (type: string): string => {
    switch (type) {
      case "natural_feature": // пляжи
        return "#4DB6AC"; // бирюзовый
      case "school": // школы
        return "#FF9800"; // оранжевый
      case "library": // библиотеки
        return "#BA68C8"; // пурпурный
      case "hospital": // больницы
        return "#F44336"; // красный
      case "store": // магазины
        return "#42A5F5"; // синий
      case "restaurant": // рестораны
        return "#FDD835"; // желтый
      case "pharmacy": // аптеки
        return "#66BB6A"; // зеленый
      case "gym": // спортзалы
        return "#8D6E63"; // коричневый
      default:
        return "#9E9E9E"; // серый
    }
  };

  // Компонент статической карты для отображения вместо Google Maps
  function StaticMapPlaceholder() {
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

  // Если нет координат, отображаем более простой интерфейс
  if (!latitude || !longitude) {
    return (
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
          {tProject("infrastructure.title")}
        </h2>
        <Card className="w-full">
          <CardBody className="p-6 text-center">
            <p className="text-default-600 mb-2">
              {tProject("infrastructure.noLocationData")}
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
          {tProject("infrastructure.title")}
        </h2>
        <div className="flex items-center gap-2 text-default-500 mb-8">
          <IconMapPin size={18} className="text-[#0091FF]" />
          <span>{address}</span>
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
    <div className="mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
        {tProject("infrastructure.title")}
      </h2>
      <div className="flex items-center gap-2 text-default-500 mb-8">
        <div className="flex items-center gap-[6px]">
          <HiOutlineLocationMarker size={20} className="text-[#A4A7AE]" />
          <span>{address}</span>
        </div>

        {beachDistance && (
          <div className="flex items-center gap-[6px]">
            <TbLocation size={20} className="text-[#A4A7AE]" />
            <span>{beachDistance} m to the beach</span>
          </div>
        )}
      </div>

      <MapFilters selected={activeFilters} onChange={handleFiltersChange} />

      {/* Карта */}
      <div className="h-[480px] w-full mb-8 rounded-lg overflow-hidden mt-6">
        {isClient && isLoaded && !loadError && !useStaticMap ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: latitude, lng: longitude }}
            zoom={14}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              styles: hideAllPOIStyles // Применяем стили для скрытия всех POI
            }}
          >
            <Marker
              position={{ lat: latitude, lng: longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#0091FF",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 8
              }}
            />
            <Circle
              center={{ lat: latitude, lng: longitude }}
              options={circleOptions}
            />
          </GoogleMap>
        ) : (
          <StaticMapPlaceholder />
        )}
      </div>

      {/* Рейтинги */}
      <div>
        <h3 className="text-xl font-semibold mb-6 text-default-900">
          {tProject("infrastructure.areaRating")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-6 md:gap-6">
          {ratings.map((rating, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] dark:bg-[#1F1F1F] md:rounded-xl md:p-6 flex flex-col md:flex-row items-start md:gap-4 md:shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              <RatingCircle
                value={rating.value}
                maxValue={rating.maxValue}
                icon={rating.icon}
              />
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-1 w-full">
                  <h4 className="text-sm leading-5 md:text-lg font-medium md:font-semibold md:leading-tight md:max-w-[70%]">
                    {rating.title}
                  </h4>
                  <span className="text-sm font-normal md:font-medium text-default-900">
                    {rating.value}/{rating.maxValue}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                  {rating.description}
                </p>
              </div>

              <div className="grid grid-cols-10 w-full h-1 rounded-[4px] md:hidden overflow-clip bg-gray-100">
                <div
                  style={{
                    backgroundColor: getStrokeColor(rating.value),
                    gridColumn: `span ${rating.value} / span ${rating.value}`
                  }}
                  className="overflow-clip rounded-[4px]"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Вспомогательные функции для работы с API
async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  type: string,
  radius: number
) {
  const response = await fetch(
    `/api/places/nearby?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`
  );
  return response.json();
}

async function fetchCrimeRate(lat: number, lng: number) {
  // Запрос к API с данными о преступности
  return 4; // Заглушка
}

async function fetchNoiseLevel(lat: number, lng: number) {
  // Запрос к API с данными об уровне шума
  return 3; // Заглушка
}

async function calculateRentalDemand(lat: number, lng: number) {
  // Расчет спроса на аренду на основе данных о рынке
  return 4; // Заглушка
}

async function fetchWeatherConditions(lat: number, lng: number) {
  // Запрос к API погоды
  return 4; // Заглушка
}

const calculateRatings = (placesData: PlacesResponse[], t: any) => {
  const [transitData, amenitiesData, beachData, schoolsData] = placesData;

  // Транспортная доступность
  const transitScore = Math.min(
    Math.ceil((transitData?.results?.length || 0) / 2),
    5
  );
  const transitDescription =
    transitData?.results && transitData.results.length > 0
      ? t("infrastructure.ratings.publicTransport.descriptions.many", {
          count: transitData.results.length
        })
      : t("infrastructure.ratings.publicTransport.descriptions.few");

  // Инфраструктура
  const amenitiesScore = Math.min(
    Math.ceil((amenitiesData?.results?.length || 0) / 10),
    5
  );
  const amenitiesDescription =
    amenitiesData?.results && amenitiesData.results.length > 0
      ? t("infrastructure.ratings.amenities.descriptions.many", {
          count: amenitiesData.results.length
        })
      : t("infrastructure.ratings.amenities.descriptions.few");

  // Пляжи
  const beaches =
    beachData?.results?.filter(place =>
      place.name.toLowerCase().includes("beach")
    ) || [];
  const beachScore = Math.min(beaches.length + 3, 5);
  const beachDescription =
    beaches.length > 0
      ? t("infrastructure.ratings.beachAccess.descriptions.many", {
          count: beaches.length
        })
      : t("infrastructure.ratings.beachAccess.descriptions.one");

  // Школы
  const schoolScore = Math.min(
    Math.ceil((schoolsData?.results?.length || 0) / 2),
    5
  );
  const schoolDescription =
    schoolsData?.results && schoolsData.results.length > 0
      ? t("infrastructure.ratings.schools.descriptions.many", {
          count: schoolsData.results.length
        })
      : t("infrastructure.ratings.schools.descriptions.few");

  return [
    {
      title: t("infrastructure.ratings.publicTransport.title"),
      value: transitScore,
      maxValue: 5,
      icon: (<IconBus className={THEME.primaryText} />) as React.ReactElement,
      description: transitDescription
    },
    {
      title: t("infrastructure.ratings.amenities.title"),
      value: amenitiesScore,
      maxValue: 5,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: amenitiesDescription
    },
    {
      title: t("infrastructure.ratings.climate.title"),
      value: 2,
      maxValue: 5,
      icon: (<IconSun className={THEME.primaryText} />) as React.ReactElement,
      description: t("infrastructure.ratings.climate.descriptions.extreme")
    },
    {
      title: t("infrastructure.ratings.beachAccess.title"),
      value: beachScore,
      maxValue: 5,
      icon: (<IconBeach className={THEME.primaryText} />) as React.ReactElement,
      description: beachDescription
    },
    {
      title: t("infrastructure.ratings.rental.title"),
      value: 4,
      maxValue: 5,
      icon: (<IconCash className={THEME.primaryText} />) as React.ReactElement,
      description: t("infrastructure.ratings.rental.descriptions.above")
    },
    {
      title: t("infrastructure.ratings.safety.title"),
      value: 5,
      maxValue: 5,
      icon: (
        <IconShield className={THEME.primaryText} />
      ) as React.ReactElement,
      description: t("infrastructure.ratings.safety.descriptions.high")
    },
    {
      title: t("infrastructure.ratings.noise.title"),
      value: 3,
      maxValue: 5,
      icon: (
        <IconVolume className={THEME.primaryText} />
      ) as React.ReactElement,
      description: t("infrastructure.ratings.noise.descriptions.moderate")
    },
    {
      title: t("infrastructure.ratings.schools.title"),
      value: schoolScore,
      maxValue: 5,
      icon: (
        <IconSchool className={THEME.primaryText} />
      ) as React.ReactElement,
      description: schoolDescription
    }
  ];
};
