import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string; stageId: string } }
) {
    try {
        const { stageId, id: projectId } = params;
        const body = await request.json();

        console.log('Updating stage with data:', { stageId, projectId, body });

        const updatedStage = await prisma.paymentStage.update({
            where: {
                id: stageId,
                projectId: projectId
            },
            data: {
                stageName: body.stageName,
                paymentAmount: body.paymentAmount
            }
        });

        console.log('Stage updated successfully:', updatedStage);

        return NextResponse.json({ 
            success: true, 
            data: updatedStage 
        });
    } catch (error) {
        console.error('Detailed error updating payment stage:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update payment stage' },
            { status: 500 }
        );
    }
} 