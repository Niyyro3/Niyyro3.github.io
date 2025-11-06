
'use server';
/**
 * @fileOverview A flow for explaining an exam question to a student.
 *
 * - explainExamQuestion - A function that provides a helpful explanation.
 * - ExplainExamQuestionInput - The input type for the function.
 * - ExplainExamQuestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainExamQuestionInputSchema = z.object({
  question: z.string().describe('The exam question the student needs help with.'),
  topic: z.string().describe('The subject topic of the question.'),
});
export type ExplainExamQuestionInput = z.infer<typeof ExplainExamQuestionInputSchema>;

const ExplainExamQuestionOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A helpful explanation of the question. It should break down the question, define key scientific terms, and hint at how to structure a good answer without giving the answer away directly.'
    ),
});
export type ExplainExamQuestionOutput = z.infer<typeof ExplainExamQuestionOutputSchema>;

export async function explainExamQuestion(
  input: ExplainExamQuestionInput
): Promise<ExplainExamQuestionOutput> {
  return explainExamQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainExamQuestionPrompt',
  input: { schema: ExplainExamQuestionInputSchema },
  output: { schema: ExplainExamQuestionOutputSchema },
  prompt: `You are a friendly and encouraging GCSE Science tutor. A student is stuck on an exam question and has asked for help.

Your task is to explain the question to them. Do NOT give them the answer.

Instead, you should:
1.  Break down the question into smaller parts.
2.  Define any key scientific terms in the question.
3.  Explain the core concepts the question is testing.
4.  Give them a hint about how to structure their answer or what to include.
5.  Keep your tone supportive and helpful.

Topic: {{{topic}}}
Question: "{{{question}}}"
`,
});

const explainExamQuestionFlow = ai.defineFlow(
  {
    name: 'explainExamQuestionFlow',
    inputSchema: ExplainExamQuestionInputSchema,
    outputSchema: ExplainExamQuestionOutputSchema,
  },
  async (input) => {
     let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('Generated explanation was empty.');
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
    throw new Error('Failed to generate explanation after multiple retries.');
  }
);
