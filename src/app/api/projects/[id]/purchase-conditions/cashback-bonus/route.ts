import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const bonuses = await prisma.cashbackBonus.findMany({
      where: {
        projectId: projectId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      bonuses 
    });
  } catch (error) {
    console.error("[CASHBACK_BONUSES]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { bonuses } = await request.json();
    const projectId = params.id;

    // Сначала удаляем все существующие бонусы для данного проекта
    await prisma.CashbackBonus.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    // Затем создаем новые бонусы
    const cashbackBonuses = await prisma.CashbackBonus.createMany({
      data: bonuses.map((bonus: any) => ({
        projectId: projectId,
        cashbackBonus: bonus.cashbackBonus,
        condition: bonus.condition,
      })),
    });

    return NextResponse.json({ 
      success: true, 
      data: cashbackBonuses 
    });
  } catch (error) {
    console.error("[CASHBACK_BONUSES]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
} 