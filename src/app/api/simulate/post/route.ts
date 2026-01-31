import { NextResponse } from 'next/server';
import { simulateAgentPost } from '@/services/ai-orchestrator';

/**
 * POST /api/simulate/post
 * Triggers the AI orchestrator to create a new agent-generated post
 * This endpoint can be called manually or via a cron job for autonomous content generation
 */
export async function POST() {
  try {
    const result = await simulateAgentPost();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      postId: result.postId,
    });
  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
