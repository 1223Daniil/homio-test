// import type { Project, Location, ProjectTranslation, ProjectMedia, Developer, MediaCategory } from "@prisma/client";

// export type ProjectWithRelations = Project & {
//   translations: ProjectTranslation[];
//   location: {
//     id: string;
//     createdAt: Date;
//     updatedAt: Date;
//     country: string;
//     city: string;
//     district: string;
//     address: string;
//     latitude: number;
//     longitude: number;
//     beachDistance: number | null;
//     centerDistance: number | null;
//   } | null;
//   media: {
//     id: string;
//     title: string | null;
//     createdAt: Date;
//     updatedAt: Date;
//     order: number;
//     url: string;
//     description: string | null;
//     projectId: string;
//     type: string;
//     category: MediaCategory;
//   }[];
//   developer: Developer & {
//     translations: ProjectTranslation[];
//   };
//   amenities: {
//     amenity: {
//       name: string;
//       id: string;
//       description: string | null;
//       createdAt: Date;
//       updatedAt: Date;
//       icon: string | null;
//     };
//     name: string | null;
//     id: string;
//     createdAt: Date;
//     updatedAt: Date;
//     projectId: string;
//     category: string | null;
//     amenityId: string;
//   }[];
//   yield: {
//     id: string;
//     projectId: string;
//     guaranteed: number | null;
//     potential: number | null;
//     expected: number | null;
//     createdAt: Date;
//     updatedAt: Date;
//   } | null;
//   units: {
//     id: string;
//     number: string;
//     floor: number;
//     bedrooms: number;
//     bathrooms: number;
//     area: number;
//     price: number;
//     status: string;
//     projectId: string;
//     createdAt: Date;
//     updatedAt: Date;
//   }[];

// }; 

import type { 
  Project, 
  Location as PrismaLocation, 
  ProjectTranslation as PrismaProjectTranslation, 
  ProjectMedia, 
  Developer, 
  MediaCategory, 
  DeveloperTranslation, 
  Amenity, 
  ProjectAmenity, 
  Unit, 
  ProjectYield 
} from "@prisma/client";

export interface LocationType {
  id: string;
  country: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  beachDistance: number | null;
  centerDistance: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTranslationType extends PrismaProjectTranslation {
  id: string;
  projectId: string;
  language: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithRelations extends Project {
  id: string;
  location: LocationType | null;
  translations: ProjectTranslationType[];
  media: ProjectMedia[];
  developer: Developer & {
    translations: DeveloperTranslation[];
    logo?: string;
  };
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
  units: Unit[];
  yield?: ProjectYield | null;
}

export interface UnitWithRelations extends Unit {
  project: ProjectWithRelations;
  media: ProjectMedia[];
  building: {
    floors: number;
    floorPlans: string[];
  };
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
} & (
  | {
      type: "project";
      data: ProjectWithRelations;
      price: number | null;
    }
  | {
      type: "unit";
      data: UnitWithRelations[];
      count: number;
    }
); 