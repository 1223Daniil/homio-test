import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Course, Quiz } from "@prisma/client";

// Типы, совместимые с CourseViewer
export interface ViewerQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface ViewerQuiz {
  id: string;
  title: string;
  questions: ViewerQuestion[];
}

export interface ViewerLesson {
  id: string;
  title: string;
  content?: string;
  status: string;
  imageUrl?: string | null;
  quiz?: {
    id: string;
    title: string;
  } | null;
}

export interface ViewerModule {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: string;
  lessons: ViewerLesson[];
}

export interface ViewerCourse {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: string;
  marketContext?: string | null;
  sources?: string[];
  modules: ViewerModule[];
}

// Типы с данными от API
export interface ApiQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface ApiQuiz {
  id: string;
  title: string;
  description: string | null;
  questions: ApiQuestion[];
}

export interface ApiLesson {
  id: string;
  title: string;
  content: string | null;
  status: string;
  imageUrl: string | null;
  quiz?: ApiQuiz | null;
}

export interface ApiModule {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: ApiLesson[];
}

export interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  imageUrl: string | null;
  marketContext: string | null;
  sources: string[];
  modules: ApiModule[];
}

interface UseCourseTransformResult {
  viewerCourse: ViewerCourse | null;
  quizzes: Record<string, ViewerQuiz>;
}

export function useCourseTransform(apiCourse: ApiCourse | null): UseCourseTransformResult {
  const t = useTranslations("Courses");

  // Преобразуем курс из API в формат для CourseViewer
  const viewerCourse = useMemo<ViewerCourse | null>(() => {
    if (!apiCourse) return null;

    return {
      id: apiCourse.id,
      title: apiCourse.title || t("untitledCourse"),
      description: apiCourse.description || "",
      imageUrl: apiCourse.imageUrl,
      status: apiCourse.status,
      marketContext: apiCourse.marketContext,
      sources: apiCourse.sources,
      modules: apiCourse.modules.map(module => ({
        id: module.id,
        title: module.title || t("untitledModule"),
        description: module.description || "",
        status: "PUBLISHED", // Предполагаем, что модуль опубликован, если он доступен
        imageUrl: null, // В модулях часто нет изображений
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title || t("untitledLesson"),
          content: lesson.content || "",
          status: lesson.status,
          imageUrl: lesson.imageUrl,
          quiz: lesson.quiz ? {
            id: lesson.quiz.id,
            title: lesson.quiz.title || t("quizzes.untitledQuiz")
          } : null
        }))
      }))
    };
  }, [apiCourse, t]);

  // Подготавливаем quizzes в формате для CourseViewer
  const quizzes = useMemo<Record<string, ViewerQuiz>>(() => {
    const result: Record<string, ViewerQuiz> = {};
    
    if (apiCourse?.modules) {
      apiCourse.modules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            if (lesson.quiz) {
              result[lesson.quiz.id] = {
                id: lesson.quiz.id,
                title: lesson.quiz.title || t("quizzes.untitledQuiz"),
                questions: lesson.quiz.questions.map(question => ({
                  id: question.id,
                  text: question.text || "",
                  options: question.options.map(option => ({
                    id: option.id,
                    text: option.text || "",
                    isCorrect: option.isCorrect
                  }))
                }))
              };
            }
          });
        }
      });
    }
    
    return result;
  }, [apiCourse, t]);

  return {
    viewerCourse,
    quizzes
  };
} 