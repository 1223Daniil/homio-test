/*
  This file defines the unified domain types for project-related entities.
  We use these types throughout the app to ensure consistency.
*/

import {
  MediaCategory,
  ProjectClass,
  ProjectStatus,
  ProjectType
} from "@prisma/client";

export interface PaymentPlanInstallment {
  amount: number;
  dueDate: string;
  description: string;
}

export interface PaymentPlan {
  deposit: number;
  installments: PaymentPlanInstallment[];
}

export interface ProjectTranslation {
  id?: string;
  projectId?: string;
  language: string;
  locale: string;
  name: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectLocation {
  id?: string;
  projectId?: string;
  country: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  beachDistance: number;
  centerDistance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectPricing {
  id?: string;
  projectId?: string;
  basePrice: number;
  currency: {
    code: string;
    symbol: string;
  };
  pricePerSqm?: number;
  maintenanceFee?: number | null;
  maintenanceFeePeriod?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectAmenity {
  id?: string;
  name: string;
  category?: string;
  icon?: string | null;
}

export interface ProjectDeveloper {
  id?: string;
  name: string;
  logo?: string | null;
  website?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  established_year?: number | null;
  completed_units?: number | null;
  completed_projects?: number | null;
  ongoing_units?: number | null;
  ongoing_projects?: number | null;
  delivery_rate?: number | null;
  translations?: {
    language: string;
    name: string;
    description?: string | null;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectInvestment {
  id?: string;
  projectId?: string;
  rentalYield?: number | null;
  appreciation?: number | null;
  paybackPeriod?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectUnit {
  id?: string;
  projectId?: string;
  buildingId?: string | null;
  number: string;
  floor?: number | null;
  area?: number | null;
  price?: number | null;
  status?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description?: string | null;
  validUntil?: string | null;
  icon?: string | null;
  type?: string | null;
  value?: number | null;
  conditions?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectMedia {
  id?: string;
  projectId?: string;
  url: string;
  type: string;
  thumbnailUrl?: string | null;
  category?: MediaCategory;
  title?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
  isCover?: boolean;
  isMainVideo?: boolean;
}

export interface ProjectBuilding {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  floors?: number | null;
  units?: ProjectUnit[];
  status?: string | null;
  media?: ProjectMedia[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileUrl: string;
  type: string;
  category: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MasterPlanPoint {
  id: string;
  x: number;
  y: number;
  buildingId: string;
  type?: string;
  style?: {
    fill: string;
    stroke: string;
    opacity: number;
  };
  building?: {
    id: string;
    name: string;
  };
}

export interface DomainProject {
  id: string;
  name: string;
  type: ProjectType;
  translations: ProjectTranslation[];
  media: ProjectMedia[];
  location?: ProjectLocation;
  pricing?: ProjectPricing;
  amenities?: ProjectAmenity[];
  developer?: ProjectDeveloper;
  developerId?: string;
  investment?: ProjectInvestment;
  characteristics?: {
    category: string;
    value: string;
  }[];
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentPlan?: PaymentPlan;
  units?: ProjectUnit[];
  specialOffers?: string | SpecialOffer[];
  completionDate?: string | null;
  constructionStatus?: number | null;
  phase?: number | null;
  totalLandArea?: number | null;
  infrastructureArea?: number | null;
  class?: ProjectClass;
  currency?: {
    code: string;
    symbol: string;
  };
  documents?: ProjectDocument[];
  publicTransport?: number | null;
  amenitiesLevel?: number | null;
  climateConditions?: number | null;
  beachAccess?: number | null;
  rentalDemand?: number | null;
  safetyLevel?: number | null;
  noiseLevel?: number | null;
  schoolsAvailable?: number | null;
  buildings?: ProjectBuilding[];
  siteUrl?: string | null;
  deliveryStage?: string | null;
  embedding?: number[] | null;
}

export interface DomainProjectWithRelations extends DomainProject {
  location: NonNullable<DomainProject["location"]>;
  pricing: NonNullable<DomainProject["pricing"]>;
  amenities: NonNullable<DomainProject["amenities"]>;
  developer: NonNullable<DomainProject["developer"]>;
  investment: NonNullable<DomainProject["investment"]>;
}
