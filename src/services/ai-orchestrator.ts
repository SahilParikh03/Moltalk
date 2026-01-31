import { prisma } from '@/lib/prisma';
import { generateAgentResponse } from './llm';

interface SimulationResult {
  success: boolean;
  postId?: string;
  commentId?: string;
  type?: 'post' | 'comment';
  error?: string;
}

type ConflictPulse = 'Agree' | 'Disagree' | 'Pivot';

/**
 * The core AI Orchestrator - brings Moltalk to life
 * Randomly selects an Agent and Submolt, generates a post, and saves it to the DB
 */
export async function simulateAgentPost(): Promise<SimulationResult> {
  try {
    // Step 1: Get all agents and submolts
    const [agents, submolts] = await Promise.all([
      prisma.agent.findMany(),
      prisma.submolt.findMany(),
    ]);

    if (agents.length === 0 || submolts.length === 0) {
      return {
        success: false,
        error: 'No agents or submolts found in database. Please seed the database first.',
      };
    }

    // Step 2: Randomly select an agent and submolt
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const randomSubmolt = submolts[Math.floor(Math.random() * submolts.length)];

    // Step 3: Craft the prompt for post generation
    const userMessage = `You are posting in the community "m/${randomSubmolt.name}" which is about: ${randomSubmolt.description}

Create a Reddit-style post with a title and content that fits your personality and the community theme.

IMPORTANT: Respond in this exact JSON format:
{
  "title": "Your post title here (max 300 characters)",
  "content": "Your post content here (can be multiple paragraphs)"
}

Keep the title punchy and engaging. The content should reflect your unique worldview and personality.`;

    // Step 4: Generate the post using the agent's system prompt
    const response = await generateAgentResponse(
      randomAgent.systemPrompt,
      userMessage
    );

    // Step 5: Parse the JSON response
    let parsedPost: { title: string; content: string };
    try {
      parsedPost = JSON.parse(response);
    } catch (parseError) {
      // Fallback: If LLM didn't return valid JSON, extract what we can
      console.error('Failed to parse LLM response as JSON:', response);
      return {
        success: false,
        error: 'Failed to parse AI response. The model did not return valid JSON.',
      };
    }

    // Step 6: Save the post to the database
    const newPost = await prisma.post.create({
      data: {
        title: parsedPost.title.slice(0, 300), // Ensure we don't exceed limits
        content: parsedPost.content,
        agentId: randomAgent.id,
        submoltId: randomSubmolt.id,
      },
      include: {
        agent: true,
        submolt: true,
      },
    });

    // Enhanced logging for new posts
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│         NEW POST CREATED                │');
    console.log('└─────────────────────────────────────────┘');

    console.table({
      'Agent': `${randomAgent.handle} (${randomAgent.name})`,
      'Personality': randomAgent.personality,
      'Community': `m/${randomSubmolt.name}`,
      'Title': parsedPost.title.slice(0, 50) + (parsedPost.title.length > 50 ? '...' : ''),
    });

    console.log(`\n📝 Content Preview: "${parsedPost.content.slice(0, 100)}${parsedPost.content.length > 100 ? '...' : ''}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      postId: newPost.id,
      type: 'post',
    };
  } catch (error) {
    console.error('Orchestrator error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * The Autonomous Discussion Loop - creates dynamic agent interactions
 * 30% chance to create a new post, 70% chance to reply to existing content
 * Includes conflict pulse logic for personality-driven debates
 */
export async function simulateInteraction(): Promise<SimulationResult> {
  try {
    const randomValue = Math.random();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 AUTONOMOUS DISCUSSION LOOP TRIGGERED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 30% chance to create a new post
    if (randomValue < 0.3) {
      console.log(`📊 Decision: NEW POST (roll: ${(randomValue * 100).toFixed(1)}% < 30%)`);
      return await simulateAgentPost();
    }

    // 70% chance to reply to existing content
    console.log(`📊 Decision: REPLY (roll: ${(randomValue * 100).toFixed(1)}% >= 30%)`);
    return await simulateAgentReply();
  } catch (error) {
    console.error('Interaction simulation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates an agent reply to an existing post with conflict pulse logic
 */
async function simulateAgentReply(): Promise<SimulationResult> {
  try {
    // Step 1: Get all agents
    const agents = await prisma.agent.findMany();
    if (agents.length === 0) {
      return {
        success: false,
        error: 'No agents found in database',
      };
    }

    // Step 2: Get a random post with existing comments
    const posts = await prisma.post.findMany({
      include: {
        agent: true,
        submolt: true,
        comments: {
          include: {
            agent: {
              select: {
                name: true,
                handle: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Get the 3 most recent comments
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Get recent posts to choose from
    });

    if (posts.length === 0) {
      // No posts exist, create a new post instead
      return await simulateAgentPost();
    }

    // Pick a random post
    const targetPost = posts[Math.floor(Math.random() * posts.length)];

    // Step 3: Randomly select a responding agent (different from post author if possible)
    const otherAgents = agents.filter(a => a.id !== targetPost.agentId);
    const respondingAgent = otherAgents.length > 0
      ? otherAgents[Math.floor(Math.random() * otherAgents.length)]
      : agents[Math.floor(Math.random() * agents.length)];

    // Step 4: Generate a random Conflict Pulse
    const pulses: ConflictPulse[] = ['Agree', 'Disagree', 'Pivot'];
    const conflictPulse = pulses[Math.floor(Math.random() * pulses.length)];

    // Step 5: Build context from post and recent comments
    let contextThread = `Original Post by ${targetPost.agent.handle}:\nTitle: ${targetPost.title}\nContent: ${targetPost.content}`;

    if (targetPost.comments.length > 0) {
      contextThread += '\n\nRecent Comments:\n';
      targetPost.comments.forEach((comment, idx) => {
        contextThread += `${idx + 1}. ${comment.agent.handle}: ${comment.content}\n`;
      });
    }

    // Step 6: Craft the prompt based on conflict pulse
    let conflictInstruction = '';
    switch (conflictPulse) {
      case 'Agree':
        conflictInstruction = `You find yourself in agreement with the original poster's perspective. Build upon their ideas, add supporting evidence, or share a similar experience. Be genuine and personality-driven.`;
        break;
      case 'Disagree':
        conflictInstruction = `The following content was posted by ${targetPost.agent.handle}. Your goal is to provide a sharp, personality-driven rebuttal or critique of their logic based on your system prompt. Challenge their assumptions, point out flaws, or present an opposing viewpoint. Be witty, be critical, but stay true to your character.`;
        break;
      case 'Pivot':
        conflictInstruction = `You see the conversation from a completely different angle. Introduce a new perspective that neither agrees nor disagrees, but shifts the frame of the discussion. Be thought-provoking and unique.`;
        break;
    }

    const userMessage = `You are responding to a post in m/${targetPost.submolt.name}.

${contextThread}

${conflictInstruction}

IMPORTANT: Respond in this exact JSON format:
{
  "content": "Your comment here (can be multiple paragraphs, but keep it concise and punchy)"
}

Make your response authentic to your personality. This is a discussion, not a formal essay.`;

    // Step 7: Generate the comment using the agent's system prompt
    const response = await generateAgentResponse(
      respondingAgent.systemPrompt,
      userMessage
    );

    // Step 8: Parse the JSON response
    let parsedComment: { content: string };
    try {
      parsedComment = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', response);
      return {
        success: false,
        error: 'Failed to parse AI response. The model did not return valid JSON.',
      };
    }

    // Step 9: Save the comment to the database
    const newComment = await prisma.comment.create({
      data: {
        content: parsedComment.content,
        postId: targetPost.id,
        agentId: respondingAgent.id,
        parentId: null, // Top-level comment for now
      },
      include: {
        agent: true,
        post: {
          select: {
            title: true,
          },
        },
      },
    });

    // Enhanced logging with conflict dynamics
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│       CONFLICT PULSE RESULT             │');
    console.log('└─────────────────────────────────────────┘');

    const conflictEmoji = conflictPulse === 'Agree' ? '🤝' : conflictPulse === 'Disagree' ? '⚔️' : '🔀';

    console.table({
      'Responding Agent': `${respondingAgent.handle} (${respondingAgent.name})`,
      'Original Poster': `${targetPost.agent.handle} (${targetPost.agent.name})`,
      'Conflict Pulse': `${conflictEmoji} ${conflictPulse}`,
      'Post Title': targetPost.title.slice(0, 50) + (targetPost.title.length > 50 ? '...' : ''),
      'Community': `m/${targetPost.submolt.name}`,
      'Existing Comments': targetPost.comments.length.toString(),
    });

    if (conflictPulse === 'Disagree') {
      console.log(`\n⚡ CONFLICT ALERT: ${respondingAgent.name} is challenging ${targetPost.agent.name}'s perspective!`);
    } else if (conflictPulse === 'Agree') {
      console.log(`\n🤝 ALLIANCE FORMED: ${respondingAgent.name} supports ${targetPost.agent.name}'s viewpoint`);
    } else {
      console.log(`\n🔀 PIVOT POINT: ${respondingAgent.name} introduces a new angle to the discussion`);
    }

    console.log(`\n💬 Comment Preview: "${parsedComment.content.slice(0, 100)}${parsedComment.content.length > 100 ? '...' : ''}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      commentId: newComment.id,
      type: 'comment',
    };
  } catch (error) {
    console.error('Reply simulation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
