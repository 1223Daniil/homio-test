import {
  Amenity,
  Location,
  Project,
  ProjectAmenity,
  ProjectMedia,
  ProjectTranslation
} from "@prisma/client";

const amenityTranslations: Record<string, Record<string, string>> = {
  ru: {
    pool: "Бассейн",
    infinity_pool: "Инфинити-бассейн",
    fitness: "Фитнес-центр",
    gym: "Тренажерный зал",
    restaurant: "Ресторан",
    cafe: "Кафе",
    security: "Охрана",
    beach: "Пляж",
    parking: "Парковка",
    wifi: "Wi-Fi",
    spa: "СПА-центр",
    garden: "Сад",
    playground: "Детская площадка",
    kids_club: "Детский клуб",
    tennis: "Теннисный корт",
    shuttle: "Шаттл-сервис",
    reception: "Ресепшн 24/7",
    laundry: "Прачечная",
    storage: "Склад",
    coworking: "Коворкинг",
    meeting_room: "Конференц-зал"
  },
  en: {
    pool: "Pool",
    infinity_pool: "Infinity Pool",
    fitness: "Fitness Center",
    gym: "Gym",
    restaurant: "Restaurant",
    cafe: "Cafe",
    security: "Security",
    beach: "Beach",
    parking: "Parking",
    wifi: "Wi-Fi",
    spa: "SPA",
    garden: "Garden",
    playground: "Playground",
    kids_club: "Kids Club",
    tennis: "Tennis Court",
    shuttle: "Shuttle Service",
    reception: "24/7 Reception",
    laundry: "Laundry",
    storage: "Storage",
    coworking: "Coworking",
    meeting_room: "Meeting Room"
  }
};

export interface AIProjectLocation {
  district: string;
  city: string;
  beachDistance?: number;
  text?: string;
}

export interface AIProjectAmenity {
  name: string;
  category: string;
  icon?: string;
}

export interface AIProjectAnalysis {
  matchScore: number;
  mainComment: string;
  features: string[];
  locationBenefits: string[];
  investmentPotential?: string;
}

export interface AIProject {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "PLANNING" | "CONSTRUCTION" | "COMPLETED";
  images: string[];
  description?: string;
  location?: AIProjectLocation;
  type?: string;
  amenities: AIProjectAmenity[];
  features: string[];
  analysis: AIProjectAnalysis;
  completionDate?: string;
}

export interface AIRecommendation {
  project: AIProject;
  score: number;
  aiComment: string;
  highlights: string[];
  matchingFeatures: {
    category: string;
    features: string[];
  }[];
}

export interface AIMessage {
  id: string;
  text: string;
  type: "user" | "assistant";
  recommendations?: AIRecommendation[];
}

type PrismaProjectWithRelations = Project & {
  translations: ProjectTranslation[];
  media: ProjectMedia[];
  location: Location | null;
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
};

export function convertPrismaProjectToAI(
  prismaRec: {
    project: PrismaProjectWithRelations;
    aiComment: string;
    score: number;
    highlights: string[];
    matchingFeatures: {
      category: string;
      features: string[];
    }[];
  },
  locale: string = "ru"
): AIProject {
  const { project, aiComment, score, highlights, matchingFeatures } = prismaRec;

  // Получаем перевод или оригинальное название
  const translation = project.translations.find(t => t.locale === locale);
  const name = translation?.name || project.name;
  const description = translation?.description || project.description;

  let location: AIProjectLocation | undefined = undefined;
  if (project.location) {
    location = {
      district: project.location.district,
      city: project.location.city,
      beachDistance: project.location.beachDistance || undefined,
      text: `${project.location.district}, ${project.location.city}`
    };
  }

  // Локализуем удобства
  const amenities = project.amenities
    .map(a => {
      const amenityKey = a.amenity.name.toLowerCase().replace(/\s+/g, "_");
      return {
        name: amenityTranslations[locale]?.[amenityKey] || a.amenity.name,
        category: a.amenity.category || "other",
        icon: getAmenityIcon(a.amenity.name)
      };
    })
    .filter(a => a.name);

  // Локализуем особенности
  const localizedFeatures = matchingFeatures.map(mf => ({
    ...mf,
    features: mf.features.map(f => {
      // Здесь можно добавить логику локализации особенностей
      return f;
    })
  }));

  return {
    id: project.id,
    name,
    status: project.status,
    images: project.media.map(m => m.url || "").filter(Boolean),
    description,
    type: project.type,
    location,
    amenities,
    features: localizedFeatures.flatMap(mf => mf.features),
    analysis: {
      matchScore: score,
      mainComment: aiComment,
      features: highlights,
      locationBenefits: localizedFeatures
        .filter(mf => mf.category.toLowerCase().includes("location"))
        .flatMap(mf => mf.features)
    },
    completionDate: project.completionDate?.toString()
  };
}

export function getAmenityIcon(name: string): string {
  const icons: Record<string, string> = {
    pool: "🏊‍♂️",
    gym: "💪",
    restaurant: "🍽️",
    security: "🔒",
    beach: "🏖️",
    parking: "🅿️",
    wifi: "📶",
    spa: "💆‍♀️",
    garden: "🌳",
    playground: "🎮"
  };

  const key = Object.keys(icons).find(k =>
    name.toLowerCase().includes(k.toLowerCase())
  );

  return key ? icons[key] : "✨";
}
