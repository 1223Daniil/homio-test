import { Project } from "@prisma/client";
import OpenAI from "openai";

interface CourseModule {
  title: string;
  description: string;
  lessons: {
    title: string;
    content: string;
    quiz?: {
      questions: {
        text: string;
        options: {
          text: string;
          isCorrect: boolean;
        }[];
      }[];
    };
  }[];
}

interface CourseContent {
  description: string;
  modules: CourseModule[];
}

interface CoursePreferences {
  difficulty: "beginner" | "intermediate" | "advanced";
  lessonsPerModule: number;
  includeQuizzes: boolean;
  focusAreas: string[];
  additionalNotes: string;
}

// Add error type for better error handling
interface AIGenerationError extends Error {
  code?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Add error handling for missing API key
if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is not configured");
}

async function generateModuleOutline(
  projectName: string,
  preferences: CoursePreferences
): Promise<CourseContent> {
  const outlineResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an expert course creator specializing in real estate and construction projects."
      },
      {
        role: "user",
        content: `
          Create a detailed course outline for a ${preferences.difficulty} level course about the project "${projectName}".
          The course should focus on: ${preferences.focusAreas.join(", ")}.
          Each module should have exactly ${preferences.lessonsPerModule} lessons.
          Additional context: ${preferences.additionalNotes}
          
          Format the response as JSON with the following structure:
          {
            "description": "Course overview",
            "modules": [
              {
                "title": "Module title",
                "description": "Module description",
                "lessons": [
                  {
                    "title": "Lesson title",
                    "content": "Lesson content outline"
                  }
                ]
              }
            ]
          }
        `
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = outlineResponse.choices[0].message.content;
  return content ? JSON.parse(content) : { description: "", modules: [] };
}

async function generateModuleQuiz(
  moduleTitle: string,
  lessonTitles: string[]
): Promise<{
  questions: {
    text: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
}> {
  const quizResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert in creating educational assessments."
      },
      {
        role: "user",
        content: `
          Create a quiz for the module "${moduleTitle}" with the following lessons:
          ${lessonTitles.map(title => "- " + title).join("\n")}
          
          Format the response as JSON with 3 questions per module:
          {
            "questions": [
              {
                "text": "Question text",
                "options": [
                  {
                    "text": "Option text",
                    "isCorrect": boolean
                  }
                ]
              }
            ]
          }
        `
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = quizResponse.choices[0].message.content;
  return content ? JSON.parse(content) : { questions: [] };
}

export async function generateCourseContent(
  project: Project & { translations: Array<{ name: string }> },
  preferences: CoursePreferences
): Promise<CourseContent> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Step 1: Generate course outline
    const courseOutline = await generateModuleOutline(
      project.translations[0].name,
      preferences
    );

    // Step 2: If quizzes are required, generate them for each module
    if (preferences.includeQuizzes) {
      for (const courseModule of courseOutline.modules) {
        const lessonTitles = courseModule.lessons.map(l => l.title);
        const quiz = await generateModuleQuiz(courseModule.title, lessonTitles);

        // Add quiz to the last lesson of the module
        const lastLesson =
          courseModule.lessons[courseModule.lessons.length - 1];
        if (lastLesson) {
          lastLesson.quiz = quiz;
        }
      }
    }

    return courseOutline;
  } catch (error) {
    const aiError = error as AIGenerationError;
    console.error("Error generating course content:", {
      message: aiError.message,
      code: aiError.code,
      stack: aiError.stack
    });

    // Provide more specific error messages
    if (aiError.code === "insufficient_quota") {
      throw new Error("AI service quota exceeded");
    } else if (aiError.message.includes("API key")) {
      throw new Error("AI service configuration error");
    }

    throw new Error("Failed to generate course content");
  }
}
