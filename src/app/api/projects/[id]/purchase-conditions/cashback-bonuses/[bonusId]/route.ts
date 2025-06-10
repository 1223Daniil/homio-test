import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string; bonusId: string } }
) {
    try {
        const { bonusId, id: projectId } = params;
        const { cashbackBonus, condition } = await request.json();


        // First check if the bonus exists
        const existingBonus = await prisma.cashbackBonus.findUnique({
            where: {
                id: bonusId,
            },
        });

        if (!existingBonus) {
            console.error('Cashback bonus not found:', bonusId);
            return NextResponse.json(
                { success: false, error: "Cashback bonus not found" },
                { status: 404 }
            );
        }

        // Validate input data
        if (typeof cashbackBonus !== 'number' && typeof cashbackBonus !== 'string') {
            console.error('Invalid cashbackBonus value:', cashbackBonus);
            return NextResponse.json(
                { success: false, error: "Invalid cashbackBonus value" },
                { status: 400 }
            );
        }

        if (!condition || typeof condition !== 'string') {
            console.error('Invalid condition value:', condition);
            return NextResponse.json(
                { success: false, error: "Invalid condition value" },
                { status: 400 }
            );
        }

        const updatedBonus = await prisma.cashbackBonus.update({
            where: {
                id: bonusId,
                projectId: projectId
            },
            data: {
                cashbackBonus: parseFloat(cashbackBonus.toString()),
                condition
            }
        });

        console.log('Bonus updated successfully:', updatedBonus);

        return NextResponse.json({
            success: true,
            data: updatedBonus
        });
    } catch (error) {
        console.error('Error updating cashback bonus:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : "Failed to update cashback bonus",
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
} 