import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const projectId = params.id;

    // Создаем или обновляем условия покупки
    const purchaseConditions = await prisma.purchaseConditions.upsert({
      where: {
        projectId: projectId,
      },
      update: {
        currentCurrency: data.currentCurrency,
        leaseholdDuration: data.leaseholdDuration,
        reservationFee: data.reservationFee,
        reservationDuration: data.reservationDuration,
        onTimePaymentDiscont: data.onTimePaymentDiscont,
      },
      create: {
        projectId: projectId,
        currentCurrency: data.currentCurrency,
        leaseholdDuration: data.leaseholdDuration,
        reservationFee: data.reservationFee,
        reservationDuration: data.reservationDuration,
        onTimePaymentDiscont: data.onTimePaymentDiscont,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: purchaseConditions 
    });
  } catch (error) {
    console.error("[PURCHASE_CONDITIONS_MAIN]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
} 