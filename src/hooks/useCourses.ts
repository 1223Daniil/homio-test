import { useState, useEffect } from "react";
import { Course } from "@prisma/client";
import { useTranslations } from "next-intl";

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationData;
  setPage: (page: number) => void;
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 6
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/courses?page=${page}&limit=6`);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch courses"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [page]);

  return { courses, isLoading, error, pagination, setPage };
}
