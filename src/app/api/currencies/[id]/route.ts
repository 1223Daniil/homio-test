import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.code || !data.symbol || !data.name || data.rate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if currency with this code already exists (excluding current currency)
    const existingCurrency = await prisma.currency.findFirst({
      where: {
        code: data.code,
        id: { not: awaitedParams.id }
      }
    });

    if (existingCurrency) {
      return NextResponse.json(
        { error: "Currency with this code already exists" },
        { status: 400 }
      );
    }

    // If this is set as base currency, unset any existing base currency
    if (data.isBaseCurrency) {
      await prisma.currency.updateMany({
        where: {
          isBaseCurrency: true,
          id: { not: awaitedParams.id }
        },
        data: { isBaseCurrency: false }
      });
    }

    const currency = await prisma.currency.update({
      where: { id: awaitedParams.id },
      data: {
        code: data.code.toUpperCase(),
        symbol: data.symbol,
        name: data.name,
        rate: data.rate,
        isBaseCurrency: data.isBaseCurrency || false
      }
    });

    return NextResponse.json(currency);
  } catch (error) {
    console.error("Error updating currency:", error);
    return NextResponse.json(
      { error: "Failed to update currency" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is the base currency
    const currency = await prisma.currency.findUnique({
      where: { id: awaitedParams.id }
    });

    if (!currency) {
      return NextResponse.json(
        { error: "Currency not found" },
        { status: 404 }
      );
    }

    if (currency.isBaseCurrency) {
      return NextResponse.json(
        { error: "Cannot delete base currency" },
        { status: 400 }
      );
    }

    // Check if currency is in use
    const [
      projectPricingsCount,
      propertyTypesCount,
      unitsCount,
      discountUnitsCount,
      paymentPlansCount
    ] = await Promise.all([
      prisma.projectPricing.count({ where: { currencyId: awaitedParams.id } }),
      prisma.propertyType.count({ where: { currencyId: awaitedParams.id } }),
      prisma.unit.count({ where: { currencyId: awaitedParams.id } }),
      prisma.unit.count({ where: { discountCurrencyId: awaitedParams.id } }),
      prisma.paymentPlan.count({ where: { currencyId: awaitedParams.id } })
    ]);

    const totalUsage =
      projectPricingsCount +
      propertyTypesCount +
      unitsCount +
      discountUnitsCount +
      paymentPlansCount;

    if (totalUsage > 0) {
      return NextResponse.json(
        { error: "Currency is in use and cannot be deleted" },
        { status: 400 }
      );
    }

    await prisma.currency.delete({
      where: { id: awaitedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting currency:", error);
    return NextResponse.json(
      { error: "Failed to delete currency" },
      { status: 500 }
    );
  }
}
