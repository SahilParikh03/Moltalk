import { NextResponse } from 'next/server';
import { simulateVote } from '@/services/ai-orchestrator';

/**
 * POST /api/simulate/vote
 * Triggers autonomous voting - agents vote on posts/comments based on their personality
 * This endpoint can be called manually or via a cron job for continuous voting activity
 */
export async function POST() {
  try {
    const result = await simulateVote();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.type === 'post'
        ? 'Vote cast on post successfully'
        : 'Vote cast on comment successfully',
      type: result.type,
      id: result.postId || result.commentId,
    });
  } catch (error) {
    console.error('Vote simulation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
