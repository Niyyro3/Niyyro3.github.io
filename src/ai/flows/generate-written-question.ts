
'use server';
/**
 * @fileOverview A flow for generating a single open-ended written question for a given topic.
 *
 * - generateWrittenQuestion - A function that generates a written question.
 * - GenerateWrittenQuestionInput - The input type for the function.
 * - GenerateWrittenQuestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWrittenQuestionInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or subject matter for which to generate a question.'),
  marks: z.number().min(1).max(6).describe('The number of marks the question is worth. Typical values are 2, 4, or 6.')
});
export type GenerateWrittenQuestionInput = z.infer<
  typeof GenerateWrittenQuestionInputSchema
>;

const GenerateWrittenQuestionOutputSchema = z.object({
  question: z.string().describe('The generated open-ended question.'),
  answer: z.string().describe('A concise, ideal answer to the question.'),
  explanation: z
    .string()
    .describe('A detailed mark scheme explaining how marks are awarded. Use bullet points for clarity.'),
  marks: z.number().describe('The number of marks the question is worth.')
});
export type GenerateWrittenQuestionOutput = z.infer<
  typeof GenerateWrittenQuestionOutputSchema
>;

export async function generateWrittenQuestion(
  input: GenerateWrittenQuestionInput
): Promise<GenerateWrittenQuestionOutput> {
  return generateWrittenQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWrittenQuestionPrompt',
  input: { schema: GenerateWrittenQuestionInputSchema },
  output: { schema: GenerateWrittenQuestionOutputSchema },
  prompt: `You are an expert AQA GCSE Science examiner.
  Generate a single, challenging, open-ended exam-style question for the following topic worth {{marks}} marks.
  The question should require a written answer, not a multiple-choice selection.
  Also provide a concise, ideal answer and a detailed mark scheme. The mark scheme should be broken down into bullet points, explaining exactly where each mark comes from.
  Ensure the 'marks' field in the output JSON is set to {{marks}}.

  Topic: {{{topic}}}
  `,
});

const generateWrittenQuestionFlow = ai.defineFlow(
  {
    name: 'generateWrittenQuestionFlow',
    inputSchema: GenerateWrittenQuestionInputSchema,
    outputSchema: GenerateWrittenQuestionOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('Generated written question output was empty.');
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
    throw new Error('Failed to generate written question after multiple retries.');
  }
);
