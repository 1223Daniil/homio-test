import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { expenses } = await request.json();
    const projectId = params.id;

    // Удаляем существующие расходы для проекта
    await prisma.additionalExpenses.deleteMany({
      where: {
        projectId,
      },
    });

    // Создаем новые записи для каждого расхода
    await prisma.additionalExpenses.createMany({
      data: expenses.map((expense: any) => ({
        projectId,
        nameOfExpenses: expense.nameOfExpenses,
        costOfExpenses: expense.costOfExpenses,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving additional expenses:", error);
    return NextResponse.json(
      { error: "Failed to save additional expenses" },
      { status: 500 }
    );
  }
}

// GET метод для получения дополнительных расходов
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const additionalExpenses = await prisma.additionalExpenses.findMany({
      where: {
        projectId,
      },
    });

    return NextResponse.json({ additionalExpenses });
  } catch (error) {
    console.error("Error fetching additional expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch additional expenses" },
      { status: 500 }
    );
  }
} 