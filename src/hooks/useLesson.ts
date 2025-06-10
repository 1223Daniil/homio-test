import { useState, useEffect } from "react";
import { Lesson } from "@prisma/client";

interface LessonWithQuiz extends Lesson {
  quiz?: {
    id: string;
    questions: {
      id: string;
      text: string;
    }[];
  };
}

export function useLesson(moduleId: string, lessonId: string) {
  const [lesson, setLesson] = useState<LessonWithQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/courses/modules/${moduleId}/lessons/${lessonId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lesson");
        }

        const data = await response.json();
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch lesson");
        console.error("Error fetching lesson:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId && lessonId) {
      fetchLesson();
    }
  }, [moduleId, lessonId]);

  return { lesson, isLoading, error };
}
