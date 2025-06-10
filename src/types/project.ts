import type {
  Developer,
  MasterPlanPoint,
  MediaCategory,
  Building as PrismaBuilding,
  Location as PrismaLocation,
  Project as PrismaProject,
  ProjectAmenity as PrismaProjectAmenity,
  ProjectMedia as PrismaProjectMedia,
  ProjectClass,
  ProjectDocument,
  ProjectPricing,
  ProjectStatus,
  ProjectTranslation,
  ProjectType,
  ProjectYield,
  Unit,
  UnitStatus
} from "@prisma/client";

import { CurrencyCode } from "@/utils/currency";
import { Prisma } from "@prisma/client";

export interface ExtendedProjectWithRelations
  extends Omit<PrismaProject, "class"> {
  name: string | null;
  id: string;
  slug: string | null;
  description: string | null;
  type: ProjectType;
  completionDate: Date | null;
  constructionStatus: number | null;
  totalUnits: number | null;
  totalBuildings: number | null;
  totalLandArea: number | null;
  infrastructureArea: number | null;
  publicTransport: number | null;
  amenitiesLevel: number | null;
  climateConditions: number | null;
  beachAccess: number | null;
  rentalDemand: number | null;
  safetyLevel: number | null;
  noiseLevel: number | null;
  schoolsAvailable: number | null;
  purchaseConditions: string | null;
  centerDistance: number | null;
  class: ProjectClass;
  developer?: {
    id: string;
    name: string;
    translations: Array<{
      name: string;
    }>;
    completedProjects?: number;
    ongoingProjects?: number;
    deliveryRate?: number;
  };
  location?: {
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    beachDistance?: number;
    centerDistance?: number;
  };
  translations: Array<{
    name: string;
    description?: string;
  }>;
  media?: Array<{
    url: string;
    type: string;
    category: MediaCategory;
    title?: string | null;
    description?: string | null;
    createdAt: Date;
  }>;
  amenities?: Array<{
    amenity: {
      name: string;
      icon?: string | null;
      category?: string | null;
    };
  }>;
  pricing?: ProjectPricing & {
    currency: {
      code: string;
      symbol: string;
    };
  };
  yield?: ProjectYield | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export { ProjectType, ProjectStatus, UnitStatus };

export interface ProjectBase
  extends Omit<PrismaProject, "specialOffers" | "currency" | "class"> {
  paymentPlan?: {
    deposit?: number;
    installments?: PaymentPlanInstallment[];
  };
  specialOffers?: SpecialOffer[];
  currency?: CurrencyCode;
  class?: ProjectClass;
  publicTransport: number | null;
  amenitiesLevel: number | null;
  climateConditions: number | null;
  beachAccess: number | null;
  rentalDemand: number | null;
  safetyLevel: number | null;
  noiseLevel: number | null;
  schoolsAvailable: number | null;
}

export interface PaymentPlanInstallment {
  amount: number;
  dueDate: string;
  description: string;
}

export interface PaymentPlan {
  deposit: number;
  installments: PaymentPlanInstallment[];
}

export interface SpecialOffer {
  id: string;
  title: string;
  description?: string;
  validUntil?: string;
  icon?: string;
  type?: string;
  value?: number;
  conditions?: string;
}

export interface Media {
  id: string;
  type: string;
  url: string;
  title: string | null;
  description: string | null;
  category: MediaCategory;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UnitWithMedia = Unit & {
  media: Media[];
};

export type Building = PrismaBuilding & {
  units: UnitWithMedia[];
  media: Media[];
};

export interface LocationAssessment {
  publicTransport?: number | null;
  amenitiesLevel?: number | null;
  climateConditions?: number | null;
  beachAccess?: number | null;
  rentalDemand?: number | null;
  safetyLevel?: number | null;
  noiseLevel?: number | null;
  schoolsAvailable?: number | null;
}

export interface ProjectMedia extends PrismaProjectMedia {
  title: string | null;
  description: string | null;
  type: string;
  category: MediaCategory;
  order: number;
  projectId: string;
}

export interface ProjectVideo extends PrismaProjectMedia {
  title: string | null;
  description: string | null;
  type: string;
  category: MediaCategory;
  order: number;
  projectId: string;
}

interface ProjectAmenity extends PrismaProjectAmenity {
  amenity?: {
    name: string;
    description: string | null;
  };
}

export interface ProjectWithTranslation extends ProjectBase {
  translations: ProjectTranslation[];
  location?: PrismaLocation;
  media?: ProjectMedia[];
  amenities?: ProjectAmenity[];
  documents?: ProjectDocument[];
  buildings?: Building[];
  units?: Unit[];
  pricing?: ProjectPricing;
  yield?: ProjectYield;
  developer?: Developer & {
    translations: ProjectTranslation[];
  };
  masterPlanPoints?: MasterPlanPoint[];
  purchaseConditions?: {
    currentCurrency: string;
    leaseholdDuration: number;
    reservationFee: number;
    reservationDuration: number;
    onTimePaymentDiscont: number;
  };
  paymentStages?: {
    id: string;
    stageName: string;
    paymentAmount: number;
  }[];
  agentCommissions?: {
    id: string;
    from: number;
    to: number;
    commission: number;
  }[];
  cashbackBonuses?: {
    id: string;
    cashbackBonus: number;
    condition: string;
  }[];
  additionalExpenses?: AdditionalExpense[];
}

interface AdditionalExpense {
  id: string;
  nameOfExpenses: string;
  costOfExpenses: number;
  projectId: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  deliveryStage: string;
  completionDate: string;
  location: {
    lat: number;
    lng: number;
  };
  country: string;
  city: string;
  district: string;
  streetAddress: string;
  translations: {
    locale: string;
    name: string;
    description: string;
  }[];
  totalUnits: number;
  constructionStatus: number;
  phase: number;
}

export interface ProjectFormData {
  general: {
    name: string;
    status: string;
  };
  location: {
    country: string;
    city: string;
  };
  parameters: {
    totalUnits: number;
  };
  paymentPlan: {
    deposit: number;
  };
}

export interface Project {
  id: string;
  name: string;
  type: string;
  translations: {
    name: string;
    description?: string;
  }[];
  media: {
    url: string;
    type: string;
  }[];
  location?: {
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    beachDistance?: number;
  };
  pricing?: {
    basePrice: number;
    currency: {
      code: string;
      symbol: string;
    };
    pricePerSqm?: number;
  };
  amenities?: {
    name: string;
    category?: string;
  }[];
  developer?: {
    name: string;
    rating?: number;
    completedProjects?: number;
  };
  investment?: {
    rentalYield?: number;
    appreciation?: number;
    paybackPeriod?: number;
  };
  characteristics?: {
    category: string;
    value: string;
  }[];
  status: "active" | "pending" | "sold" | "inactive";
  createdAt: string;
  updatedAt: string;
  paymentPlan?: PaymentPlan;
}

export interface ProjectWithRelations
  extends Prisma.ProjectGetPayload<{
    include: {
      location: true;
      media: true;
      amenities: {
        include: {
          amenity: true;
        };
      };
      yield: true;
    };
  }> {
  developer?: Developer;
  location?: ProjectLocation;
  name: string;
  translations?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface Developer {
  id?: string;
  name: string;
  logo?: string | null;
  rating?: number;
  completedProjects?: number;
  ongoingProjects?: number;
}

export interface ProjectLocation {
  city: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  beachDistance?: number;
  centerDistance?: number;
}
