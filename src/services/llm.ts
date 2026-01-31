import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateAgentResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    system: systemPrompt,
    prompt: userMessage,
  });

  return text;
}
