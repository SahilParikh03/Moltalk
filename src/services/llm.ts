import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Generates AI agent responses using OpenAI GPT-4o
 * GPT-4o provides high-quality, nuanced debates and personality-driven content
 */
export async function generateAgentResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    prompt: userMessage,
  });

  return text;
}
