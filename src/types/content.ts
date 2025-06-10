// Типы для регионов
export type ContentRegion = "GLOBAL" | "THAILAND" | "BALI" | "UAE";

// Типы для статусов секций
export type SectionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// Типы для типов секций
export type SectionType = 
  | "HERO" 
  | "BLOG_POSTS" 
  | "LIFESTYLE_AREAS" 
  | "CURATED_COLLECTIONS" 
  | "LIFESTYLE_COLUMN" 
  | "UPCOMING_EVENTS" 
  | "CALL_TO_ACTION";

// Типы для блог-постов
export type BlogPostType = "INTERVIEW" | "ARTICLE" | "GUIDE" | "NEWS";
export type Region = "GLOBAL" | "THAILAND" | "BALI" | "UAE";

// Интерфейс для блог-постов
export interface BlogPost {
  id: string;
  type: BlogPostType;
  image?: string;
  author?: string;
  authorRole?: string;
  authorAvatar?: string;
  readTime?: number;
  isActive: boolean;
  region: Region;
  publishedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  translations: BlogPostTranslation[];
}

// Интерфейс для переводов блог-постов
export interface BlogPostTranslation {
  id: string;
  postId: string;
  locale: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Интерфейс для секций домашней страницы
export interface HomePageSection {
  id: string;
  type: SectionType;
  status: SectionStatus;
  order: number;
  isActive: boolean;
  settings?: Record<string, any>;
  region: ContentRegion;
  createdAt: string;
  updatedAt: string;
  translations: HomePageSectionTranslation[];
}

// Интерфейс для переводов секций домашней страницы
export interface HomePageSectionTranslation {
  id: string;
  sectionId: string;
  locale: string;
  title: string;
  subtitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для районов по стилю жизни
export interface LifestyleArea {
  id: string;
  image: string;
  projectCount: number;
  category: string;
  order: number;
  isActive: boolean;
  region: ContentRegion;
  createdAt: string;
  updatedAt: string;
  sectionId?: string;
  locationId?: string;
  translations: LifestyleAreaTranslation[];
}

// Интерфейс для переводов районов по стилю жизни
export interface LifestyleAreaTranslation {
  id: string;
  areaId: string;
  locale: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для подборок проектов
export interface CuratedCollection {
  id: string;
  mainImage: string;
  projectCount: number;
  order: number;
  isActive: boolean;
  region: ContentRegion;
  createdAt: string;
  updatedAt: string;
  sectionId?: string;
  translations: CuratedCollectionTranslation[];
  projects?: string[]; // ID проектов в подборке
}

// Интерфейс для переводов подборок проектов
export interface CuratedCollectionTranslation {
  id: string;
  collectionId: string;
  locale: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для событий
export interface UpcomingEventTranslation {
  id: string;
  eventId: string;
  locale: string;
  title: string;
  description: string;
  location: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpcomingEvent {
  id: string;
  image?: string;
  startDate: Date | string;
  endDate?: Date | string;
  isActive: boolean;
  region: Region;
  location?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  translations: UpcomingEventTranslation[];
}

// Типы для подборок
export interface PropertyCollectionTranslation {
  id: string;
  collectionId: string;
  locale: string;
  title: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyCollection {
  id: string;
  image: string | null;
  isActive: boolean;
  region: ContentRegion;
  createdAt: Date;
  updatedAt: Date;
  translations: PropertyCollectionTranslation[];
  properties: PropertyToCollection[];
}

export interface PropertyToCollection {
  id: string;
  propertyId: string;
  collectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для блоков контента
export interface ContentBlock {
  id: string;
  key: string;
  isActive: boolean;
  region: ContentRegion;
  createdAt: string;
  updatedAt: string;
  sectionId?: string;
  translations: ContentBlockTranslation[];
}

// Интерфейс для переводов блоков контента
export interface ContentBlockTranslation {
  id: string;
  blockId: string;
  locale: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
} 