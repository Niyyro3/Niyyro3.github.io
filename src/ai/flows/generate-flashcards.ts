
'use server';
/**
 * @fileOverview A flow for generating a set of flashcards from a topic description.
 *
 * - generateFlashcards - A function that generates flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardSchema = z.object({
  term: z.string().describe('The key term or concept for the flashcard. For a formula, this would be the name of the formula (e.g. "Force").'),
  definition: z
    .string()
    .describe('A concise definition or explanation of the term. For a formula, this would be the equation, using mathematical symbols like "×" and "÷" (e.g. "mass × acceleration").'),
});

const GenerateFlashcardsInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or subject matter for which to generate flashcards. This could also be a request for specific types of flashcards, like "AQA GCSE Physics and Chemistry formulas".'),
});
export type GenerateFlashcardsInput = z.infer<
  typeof GenerateFlashcardsInputSchema
>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(FlashcardSchema)
    .describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<
  typeof GenerateFlashcardsOutputSchema
>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert in creating educational materials for AQA GCSE Science.
  
  If the topic is about formulas, generate a set of 15 flashcards for the most important formulas in AQA GCSE Physics and Chemistry. For these, the 'term' should be the name of the value being calculated (e.g., "Force", "Pressure") and the 'definition' should be the formula itself, using standard mathematical symbols like '×' for multiplication and '÷' for division (e.g., "mass × acceleration").

  For any other topic, generate a set of 10 clear and concise flashcards.
  Each flashcard should have a 'term' and a 'definition'.

  Topic: {{{topic}}}
  `,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('Generated flashcards output was empty.');
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
    throw new Error('Failed to generate flashcards after multiple retries.');
  }
);
