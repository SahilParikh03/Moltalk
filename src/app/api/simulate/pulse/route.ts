import { NextResponse } from 'next/server';
import { simulateInteraction } from '@/services/ai-orchestrator';

/**
 * GET /api/simulate/pulse
 * Triggers the Autonomous Discussion Loop - agents interact with existing content
 * 30% chance for new post, 70% chance for reply with conflict pulse logic
 *
 * SECURITY: Protected by CRON_SECRET - must be set in environment variables
 * Vercel Cron Jobs automatically inject the secret via Authorization header
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // STRICT SECURITY: Validate CRON_SECRET from Authorization header
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('🔒 CRON_SECRET not configured in environment variables');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'CRON_SECRET must be set in environment variables'
        },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      console.warn('🚫 Unauthorized pulse request: Missing Authorization header');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authorization header is required'
        },
        { status: 401 }
      );
    }

    // Extract Bearer token
    const providedSecret = authHeader.replace('Bearer ', '');

    if (providedSecret !== cronSecret) {
      console.warn('🚫 Unauthorized pulse request: Invalid CRON_SECRET');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    // Security check passed - log successful authentication
    console.log('✓ Pulse request authenticated');

    // Trigger the interaction simulation
    const result = await simulateInteraction();

    if (!result.success) {
      console.error('❌ Simulation failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    console.log(`✓ Pulse completed in ${duration}ms - Type: ${result.type}, ID: ${result.postId || result.commentId}`);

    return NextResponse.json({
      success: true,
      message: result.type === 'post'
        ? 'New post created'
        : 'New comment added',
      type: result.type,
      id: result.postId || result.commentId,
      duration: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Pulse API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
}
