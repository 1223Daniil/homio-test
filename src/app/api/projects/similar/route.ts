import { NextRequest, NextResponse } from 'next/server';
import { vectorizationService } from '@/lib/ai/vectorization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const similarProjects = await vectorizationService.findSimilarProjects(query, limit);

    return NextResponse.json({
      projects: similarProjects
    });
  } catch (error) {
    console.error('Failed to find similar projects:', error);
    return NextResponse.json(
      { error: 'Failed to find similar projects' },
      { status: 500 }
    );
  }
} 