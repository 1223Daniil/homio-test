import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: {
        code: 'asc'
      }
    });
    return NextResponse.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.code || !data.symbol || !data.name || data.rate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if currency with this code already exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { code: data.code }
    });

    if (existingCurrency) {
      return NextResponse.json({ error: "Currency with this code already exists" }, { status: 400 });
    }

    // If this is set as base currency, unset any existing base currency
    if (data.isBaseCurrency) {
      await prisma.currency.updateMany({
        where: { isBaseCurrency: true },
        data: { isBaseCurrency: false }
      });
    }

    const currency = await prisma.currency.create({
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
    console.error("Error creating currency:", error);
    return NextResponse.json({ error: "Failed to create currency" }, { status: 500 });
  }
} 