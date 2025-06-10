import { useTranslations } from 'next-intl';
import { Card, Chip } from "@heroui/react";
import { 
  Shield, 
  Waves,
  Dumbbell, 
  Baby, 
  Building, 
  Coffee, 
  Bus,
  Check, 
  Star
} from 'lucide-react';

interface AmenityIconProps {
  category: string;
  name: string;
}

type IconMap = {
  [key: string]: JSX.Element;
};

const AmenityIcon = ({ category, name }: AmenityIconProps) => {
  const icons: IconMap = {
    security: <Shield className="w-4 h-4" />,
    leisure: <Waves className="w-4 h-4" />,
    sports: <Dumbbell className="w-4 h-4" />,
    children: <Baby className="w-4 h-4" />,
    infrastructure: <Building className="w-4 h-4" />,
    services: <Coffee className="w-4 h-4" />,
    transport: <Bus className="w-4 h-4" />,
    beach: <Waves className="w-4 h-4" />,
    default: <Check className="w-4 h-4" />
  };

  return icons[category] || icons.default;
};

interface Amenity {
  category: string;
  name: string;
  icon?: string;
}

interface ProjectAmenitiesProps {
  amenities: Amenity[];
  analysis?: string;
  level?: number;
}

interface GroupedAmenities {
  [key: string]: Amenity[];
}

const ProjectAmenities = ({ amenities, analysis, level }: ProjectAmenitiesProps) => {
  const t = useTranslations('Projects.amenities');

  // Группируем удобства по категориям
  const groupedAmenities = amenities.reduce<GroupedAmenities>((acc, amenity) => {
    const category = amenity.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-primary">{t('title')}</h4>
        {level && (
          <Chip
            startContent={<Star className="w-4 h-4 text-warning" />}
            className="bg-warning-50"
          >
            {t('level')}: {level}/10
          </Chip>
        )}
      </div>

      {analysis && (
        <p className="text-sm text-default-600">{analysis}</p>
      )}

      <div className="space-y-2">
        {Object.entries(groupedAmenities).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <div className="text-sm font-medium text-default-600">
              {t(`categories.${category}`)}
            </div>
            <div className="flex flex-wrap gap-1">
              {items.map((amenity: Amenity, idx: number) => (
                <Chip
                  key={idx}
                  startContent={<AmenityIcon category={category} name={amenity.name} />}
                  variant="flat"
                  size="sm"
                  className="bg-default-100"
                >
                  {t(`items.${category}.${amenity.name}`, { fallback: amenity.name })}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectAmenities; 