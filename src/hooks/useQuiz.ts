import { useState } from "react";
import { useRouter } from "@/config/i18n";

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  text: string;
  options: Option[];
}

export interface Quiz {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
}

export const useQuiz = (lessonId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuiz = async (quizData: Quiz) => {
    try {
      setIsLoading(true);
      const method = quiz ? "PUT" : "POST";
      const response = await fetch(`/api/lessons/${lessonId}/quiz`, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      const data = await response.json();
      setQuiz(data);
      return data;
    } catch (error) {
      console.error("Error saving quiz:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}/quiz`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      setQuiz(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    quiz,
    isLoading,
    fetchQuiz,
    saveQuiz,
    deleteQuiz
  };
};
