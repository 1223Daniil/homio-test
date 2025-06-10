import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const commissions = await prisma.agentCommission.findMany({
      where: {
        projectId: projectId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      commissions 
    });
  } catch (error) {
    console.error("[AGENT_COMMISSIONS]", error);
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
    const { commissions } = await request.json();
    const projectId = params.id;

    // Сначала удаляем все существующие комиссии для данного проекта
    await prisma.AgentCommission.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    // Затем создаем новые комиссии
    const agentCommissions = await prisma.AgentCommission.createMany({
      data: commissions.map((commission: any) => ({
        projectId: projectId,
        from: commission.from,
        to: commission.to,
        commission: commission.commission,
      })),
    });

    return NextResponse.json({ 
      success: true, 
      data: agentCommissions 
    });
  } catch (error) {
    console.error("[AGENT_COMMISSIONS]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
} 