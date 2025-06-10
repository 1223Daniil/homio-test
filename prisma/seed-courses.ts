import { PrismaClient, CourseStatus } from "@prisma/client";

const prisma = new PrismaClient();

export default async function seedCourses() {
  try {
    // Find a developer to associate courses with
    const developer = await prisma.developer.findFirst();
    if (!developer) {
      console.log("No developer found for courses");
      return;
    }

    // Create demo courses
    const courses = [
      {
        title: "Real Estate Investment Basics",
        description: "Learn the fundamentals of real estate investment",
        status: CourseStatus.PUBLISHED,
        slug: "real-estate-investment-basics"
      },
      {
        title: "Property Market Analysis",
        description: "Master the art of analyzing property markets",
        status: CourseStatus.DRAFT,
        slug: "property-market-analysis"
      }
    ];

    for (const courseData of courses) {
      const course = await prisma.course.create({
        data: {
          ...courseData,
          developerId: developer.id
        }
      });

      // Create modules for each course
      const moduleTemplates = [
        {
          title: "Introduction",
          description: "Getting started with the basics",
          status: CourseStatus.PUBLISHED
        },
        {
          title: "Advanced Concepts",
          description: "Diving deeper into the subject",
          status: CourseStatus.PUBLISHED
        }
      ];

      for (const moduleData of moduleTemplates) {
        const courseModule = await prisma.module.create({
          data: {
            ...moduleData,
            courseId: course.id
          }
        });

        // Create lessons for each module
        const lessons = [
          {
            title: "Lesson 1",
            content: "Content for lesson 1",
            status: CourseStatus.PUBLISHED
          },
          {
            title: "Lesson 2",
            content: "Content for lesson 2",
            status: CourseStatus.PUBLISHED
          }
        ];

        for (const lessonData of lessons) {
          const lesson = await prisma.lesson.create({
            data: {
              ...lessonData,
              moduleId: courseModule.id
            }
          });

          // Create quiz for the lesson
          const quiz = await prisma.quiz.create({
            data: {
              title: `Quiz for ${lesson.title}`,
              lessonId: lesson.id
            }
          });

          // Create questions for the quiz
          const questions = [
            {
              text: "Sample question 1?",
              options: {
                create: [
                  { text: "Option 1", isCorrect: true },
                  { text: "Option 2", isCorrect: false },
                  { text: "Option 3", isCorrect: false }
                ]
              }
            },
            {
              text: "Sample question 2?",
              options: {
                create: [
                  { text: "Option 1", isCorrect: false },
                  { text: "Option 2", isCorrect: true },
                  { text: "Option 3", isCorrect: false }
                ]
              }
            }
          ];

          for (const questionData of questions) {
            await prisma.quizQuestion.create({
              data: {
                ...questionData,
                quizId: quiz.id
              }
            });
          }
        }
      }
    }

    console.log("✅ Courses seeded successfully");
  } catch (error) {
    console.error("Error seeding courses:", error);
    throw error;
  }
}
