import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { QuizData } from "@/types/quiz";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Quiz"],
  endpoints: builder => ({
    getQuiz: builder.query<QuizData | null, string>({
      query: lessonId => `/lessons/${lessonId}/quiz`,
      providesTags: ["Quiz"]
    }),

    createQuiz: builder.mutation<
      QuizData,
      { lessonId: string; data: QuizData }
    >({
      query: ({ lessonId, data }) => ({
        url: `/lessons/${lessonId}/quiz`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Quiz"]
    }),

    updateQuiz: builder.mutation<
      QuizData,
      { lessonId: string; data: QuizData }
    >({
      query: ({ lessonId, data }) => ({
        url: `/lessons/${lessonId}/quiz`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Quiz"]
    }),

    deleteQuiz: builder.mutation<void, string>({
      query: lessonId => ({
        url: `/lessons/${lessonId}/quiz`,
        method: "DELETE"
      }),
      invalidatesTags: ["Quiz"]
    })
  })
});

export const {
  useGetQuizQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation
} = quizApi;
