/**
 * Общие константы и утилиты для работы с Google Maps API
 */

import { Libraries } from "@react-google-maps/api";

/**
 * Единый набор библиотек для всех компонентов, использующих Google Maps API
 * Это предотвращает ошибку "Loader must not be called again with different options"
 */
export const GOOGLE_MAPS_LIBRARIES: Libraries = ["places", "geocoding"];

/**
 * Значения по умолчанию для координат (Москва)
 */
export const DEFAULT_COORDINATES = {
  LATITUDE: 55.7558,
  LONGITUDE: 37.6173
};

/**
 * Стандартные опции для загрузки Google Maps API
 */
export const GOOGLE_MAPS_LOADER_OPTIONS = {
  id: "google-map-script",
  libraries: GOOGLE_MAPS_LIBRARIES,
  // Добавляем опции для лучшей обработки ошибок
  version: "weekly",
  language: "ru",
  region: "RU",
  channel: "homio-app"
};

/**
 * Форматирует адрес, убирая дубликаты частей
 */
export const formatAddress = (addressText: string): string => {
  if (!addressText) return "";
  const parts = addressText.split(",").map(part => part.trim());
  return parts
    .filter((item, index) => parts.indexOf(item) === index)
    .join(", ");
};

/**
 * Функция проверки API ключа Google Maps
 */
export const validateGoogleMapsApiKey = (
  apiKey: string | undefined
): boolean => {
  if (!apiKey) return false;
  if (apiKey.length < 20) return false;
  return true;
};
