
'use server';
/**
 * @fileOverview A general-purpose AI chat helper flow.
 *
 * - chat - A function that takes a chat history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatHelperFlow(input);
}

const chatHelperFlow = ai.defineFlow(
  {
    name: 'chatHelperFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const llmResponse = await ai.generate({
          prompt: input.history.slice(-1)[0]?.content || '', // Use last user message as prompt
          history: [
            {
              role: 'user',
              content: `You are a friendly and knowledgeable AI assistant for a GCSE History revision website called HistoryStudies.net.
Your purpose is to help students understand historical concepts for the Edexcel (Pearson) syllabus.
Your expertise covers the following topics:
- Superpower Relations and the Cold War
- Weimar and Nazi Germany
- Medicine in Britain, c.1250-present
- Anglo-Saxon England and the Norman Conquest (1060-66)

Be encouraging and clear in your explanations.
Keep responses concise and easy to understand for a 15-16 year old student.
Use the provided chat history to maintain context.
`,
            },
            ...input.history.slice(0, -1),
          ],
          output: {
            schema: ChatOutputSchema,
          },
        });

        const output = llmResponse.output;
        if (output) {
          return output;
        }
        throw new Error('Empty response from AI.');
      } catch (error: any) {
        if (error.status === 429 || error.status === 503) {
          retries++;
          if (retries > maxRetries) {
            return { response: 'The AI is currently busy. Please try again in a moment.' };
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        } else {
           return { response: 'Sorry, I had trouble thinking of a response.' };
        }
      }
    }
     return { response: 'Sorry, I had trouble thinking of a response.' };
  }
);
