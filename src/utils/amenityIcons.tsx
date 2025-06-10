import {
  IconBabyCarriage,
  IconBarbell,
  IconBeach,
  IconBuildingStore,
  IconParking,
  IconPaw,
  IconShield,
  IconStar,
  IconSwimming,
  IconWifi
} from "@tabler/icons-react";

// Маппинг иконок для amenities
const amenityIconMap: Record<string, React.ReactNode> = {
  wifi: <IconWifi className="w-5 h-5" />,
  internet: <IconWifi className="w-5 h-5" />,
  pool: <IconSwimming className="w-5 h-5" />,
  swimming: <IconSwimming className="w-5 h-5" />,
  "swimming pool": <IconSwimming className="w-5 h-5" />,
  pet: <IconPaw className="w-5 h-5" />,
  "pet-friendly": <IconPaw className="w-5 h-5" />,
  dogs: <IconPaw className="w-5 h-5" />,
  dog: <IconPaw className="w-5 h-5" />,
  fitness: <IconBarbell className="w-5 h-5" />,
  gym: <IconBarbell className="w-5 h-5" />,
  restaurant: <IconBuildingStore className="w-5 h-5" />,
  cafe: <IconBuildingStore className="w-5 h-5" />,
  dining: <IconBuildingStore className="w-5 h-5" />,
  playground: <IconBabyCarriage className="w-5 h-5" />,
  kids: <IconBabyCarriage className="w-5 h-5" />,
  children: <IconBabyCarriage className="w-5 h-5" />,
  beach: <IconBeach className="w-5 h-5" />,
  security: <IconShield className="w-5 h-5" />,
  parking: <IconParking className="w-5 h-5" />,
  default: <IconStar className="w-5 h-5" />
};

// Функция для получения иконки по названию amenity
export const getAmenityIcon = (
  amenityName: string | undefined,
  color?: string
): React.ReactNode => {
  if (!amenityName) {
    return <IconStar className={`w-5 h-5 ${color || "text-primary"}`} />;
  }

  // Преобразуем название в нижний регистр
  const normalizedName = amenityName.toLowerCase();

  // Сначала пробуем найти точное совпадение
  if (amenityIconMap[normalizedName]) {
    return amenityIconMap[normalizedName];
  }

  // Если точного совпадения нет, ищем частичное совпадение
  const matchingKey = Object.keys(amenityIconMap).find(
    key => normalizedName.includes(key) || key.includes(normalizedName)
  );

  return matchingKey ? amenityIconMap[matchingKey] : amenityIconMap["default"];
};
