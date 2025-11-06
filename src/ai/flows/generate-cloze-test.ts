
'use server';
/**
 * @fileOverview A flow for generating a fill-in-the-gaps (cloze) test for a given topic.
 *
 * - generateClozeTest - A function that generates a cloze test.
 * - GenerateClozeTestInput - The input type for the function.
 * - GenerateClozeTestOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClozeQuestionSchema = z.object({
  sentence: z
    .string()
    .describe(
      'A sentence with a key term replaced by "______" (six underscores).'
    ),
  answer: z.string().describe('The word that was removed from the sentence.'),
});

const GenerateClozeTestInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or subject matter for which to generate the test.'),
});
export type GenerateClozeTestInput = z.infer<typeof GenerateClozeTestInputSchema>;

const GenerateClozeTestOutputSchema = z.object({
  title: z.string().describe('The title of the cloze test.'),
  questions: z.array(ClozeQuestionSchema),
});
export type GenerateClozeTestOutput = z.infer<typeof GenerateClozeTestOutputSchema>;


export async function generateClozeTest(
  input: GenerateClozeTestInput
): Promise<GenerateClozeTestOutput> {
  return generateClozeTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClozeTestPrompt',
  input: { schema: GenerateClozeTestInputSchema },
  output: { schema: GenerateClozeTestOutputSchema },
  prompt: `You are an expert AQA GCSE Science examiner.
  Create a "fill-in-the-gaps" (cloze) test with 8 sentences for the given topic.
  Each sentence should test a key concept or vocabulary word.
  Replace a single, important keyword in each sentence with "______" (six underscores).

  Topic: {{{topic}}}
  `,
});

const generateClozeTestFlow = ai.defineFlow(
  {
    name: 'generateClozeTestFlow',
    inputSchema: GenerateClozeTestInputSchema,
    outputSchema: GenerateClozeTestOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('Generated cloze test output was empty.');
        }
        return output;
      } catch (error: any) {
        if (error.status === 429 || error.status === 503) {
          retries++;
          if (retries > maxRetries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to generate cloze test after multiple retries.');
  }
);
