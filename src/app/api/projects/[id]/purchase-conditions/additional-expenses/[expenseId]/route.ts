import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string; expenseId: string } }
) {
    try {
        const { expenseId, id: projectId } = params;
        const body = await request.json();

        const updatedExpense = await prisma.additionalExpenses.update({
            where: {
                id: expenseId,
                projectId: projectId
            },
            data: {
                nameOfExpenses: body.nameOfExpenses,
                costOfExpenses: body.costOfExpenses
            }
        });

        return NextResponse.json({ 
            success: true, 
            data: updatedExpense 
        });
    } catch (error) {
        console.error('Error updating additional expense:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update additional expense' },
            { status: 500 }
        );
    }
} 