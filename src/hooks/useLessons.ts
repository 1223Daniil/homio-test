import { useState, useEffect } from "react";
import { Lesson } from "@prisma/client";

export function useLessons(courseId: string, moduleId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }
      const data = await response.json();
      setLessons(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch lessons")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId, moduleId]);

  const createLesson = async (lessonData: Partial<Lesson>) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(lessonData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      const newLesson = await response.json();
      setLessons(prevLessons => [...prevLessons, newLesson]);
      return newLesson;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  };

  const updateLesson = async (
    lessonId: string,
    lessonData: Partial<Lesson>
  ) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(lessonData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }

      const updatedLesson = await response.json();
      setLessons(prevLessons =>
        prevLessons.map(lesson =>
          lesson.id === lessonId ? updatedLesson : lesson
        )
      );
      return updatedLesson;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      setLessons(prevLessons =>
        prevLessons.filter(lesson => lesson.id !== lessonId)
      );
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  };

  const refresh = () => {
    fetchLessons();
  };

  return {
    lessons,
    isLoading,
    isError: error,
    createLesson,
    updateLesson,
    deleteLesson,
    refresh
  };
}
