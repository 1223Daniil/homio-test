import { CourseStatus } from "@prisma/client";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  text: string;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
  questions: QuizQuestion[];
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string | null;
  status: CourseStatus;
  imageUrl: string | null;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
  quiz?: Quiz | null;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  imageUrl: string | null;
  developerId: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  marketContext: string | null;
  sources: string[];
  modules: CourseModule[];
}

export interface CourseWithRelations extends Course {
  developer: {
    id: string;
    name: string;
  };
  quizzes?: Quiz[];
}
