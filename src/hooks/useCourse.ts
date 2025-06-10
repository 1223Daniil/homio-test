import { useState, useEffect } from "react";
import { Course, Module, Lesson } from "@prisma/client";

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

interface CourseWithModules extends Course {
  modules: ModuleWithLessons[];
}

interface UseCourseResult {
  course: CourseWithModules | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCourse(courseId: string): UseCourseResult {
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch course"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse
  };
}
