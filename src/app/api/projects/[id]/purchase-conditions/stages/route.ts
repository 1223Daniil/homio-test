import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const stages = await prisma.paymentStage.findMany({
      where: {
        projectId: projectId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      stages 
    });
  } catch (error) {
    console.error("[PAYMENT_STAGES]", error);
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
    const { stages } = await request.json();
    const projectId = params.id;

    // Сначала удаляем все существующие этапы для данного проекта
    await prisma.PaymentStage.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    // Затем создаем новые этапы
    const paymentStages = await prisma.PaymentStage.createMany({
      data: stages.map((stage: any) => ({
        projectId: projectId,
        stageName: stage.stageName,
        paymentAmount: stage.paymentAmount,
      })),
    });

    return NextResponse.json({ 
      success: true, 
      data: paymentStages 
    });
  } catch (error) {
    console.error("[PAYMENT_STAGES]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
} 