
'use server';
/**
 * @fileOverview A flow for generating a matching pairs quiz.
 *
 * - generateMatchingQuiz - A function that generates a set of matching pairs.
 * - GenerateMatchingQuizInput - The input type for the function.
 * - GenerateMatchingQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MatchingPairSchema = z.object({
  id: z.string().describe('A unique identifier for the pair (e.g., "item-1").'),
  item: z.string().describe('The first part of the pair (e.g., a term, formula, or concept).'),
  match: z.string().describe('The corresponding second part of the pair (e.g., a definition, unit, or explanation).'),
});

const GenerateMatchingQuizInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or subject matter for which to generate the matching quiz.'),
});
export type GenerateMatchingQuizInput = z.infer<typeof GenerateMatchingQuizInputSchema>;

const GenerateMatchingQuizOutputSchema = z.object({
  title: z.string().describe('The title of the matching quiz.'),
  pairs: z.array(MatchingPairSchema).describe('An array of 8 matching pairs.'),
});
export type GenerateMatchingQuizOutput = z.infer<typeof GenerateMatchingQuizOutputSchema>;

export async function generateMatchingQuiz(
  input: GenerateMatchingQuizInput
): Promise<GenerateMatchingQuizOutput> {
  return generateMatchingQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMatchingQuizPrompt',
  input: { schema: GenerateMatchingQuizInputSchema },
  output: { schema: GenerateMatchingQuizOutputSchema },
  prompt: `You are an expert AQA GCSE Science examiner.
  Create a matching pairs quiz with exactly 8 pairs for the given topic.
  The pairs should connect key terms to their definitions, formulas to their names, or concepts to their explanations.
  Each pair must have a unique ID from "item-1" to "item-8".

  Topic: {{{topic}}}
  `,
});

const generateMatchingQuizFlow = ai.defineFlow(
  {
    name: 'generateMatchingQuizFlow',
    inputSchema: GenerateMatchingQuizInputSchema,
    outputSchema: GenerateMatchingQuizOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (output) {
          return output;
        }
        throw new Error('Generated matching quiz output was empty.');
      } catch (error: any) {
        retries++;
        if (retries > maxRetries) {
          console.error('Final attempt failed:', error);
          throw new Error('Failed to generate matching quiz after multiple retries.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
    throw new Error('Failed to generate matching quiz after multiple retries.');
  }
);
