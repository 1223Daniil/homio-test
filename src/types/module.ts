import { CourseStatus } from "@prisma/client";
import { CourseLesson } from "./course";

export interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: CourseStatus;
  courseId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  lessons: CourseLesson[];
}

export type ModuleUpdateData = Partial<ModuleData>; 