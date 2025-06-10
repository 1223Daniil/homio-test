import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string; commissionId: string } }
) {
    try {
        const { commissionId, id: projectId } = params;
        const body = await request.json();

        console.log('Updating agent commission with data:', { commissionId, projectId, body });

        const updatedCommission = await prisma.agentCommission.update({
            where: {
                id: commissionId,
                projectId: projectId
            },
            data: {
                from: body.from,
                to: body.to,
                commission: body.commission
            }
        });

        console.log('Agent commission updated successfully:', updatedCommission);

        return NextResponse.json({ 
            success: true, 
            data: updatedCommission 
        });
    } catch (error) {
        console.error('Detailed error updating agent commission:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update agent commission' },
            { status: 500 }
        );
    }
} 