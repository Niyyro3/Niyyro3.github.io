
'use server';
/**
 * @fileOverview A flow for grading a student's written answer against a mark scheme.
 *
 * - gradeWrittenAnswer - A function that provides feedback on a written answer.
 * - GradeWrittenAnswerInput - The input type for the function.
 * - GradeWrittenAnswerOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GradeWrittenAnswerInputSchema = z.object({
  question: z.string().describe('The exam question that was asked.'),
  marks: z.number().describe('The number of marks the question is worth.'),
  userAnswer: z.string().describe("The student's answer to the question."),
  markScheme: z
    .string()
    .describe(
      'The detailed mark scheme or model answer for the question.'
    ),
});
export type GradeWrittenAnswerInput = z.infer<
  typeof GradeWrittenAnswerInputSchema
>;

const GradeWrittenAnswerOutputSchema = z.object({
  feedback: z
    .string()
    .describe(
      'Detailed, constructive feedback for the student. It should be formatted as HTML and explain which marking points were hit and which were missed.'
    ),
  marksAwarded: z
    .number()
    .describe('The number of marks awarded for the answer.'),
});
export type GradeWrittenAnswerOutput = z.infer<
  typeof GradeWrittenAnswerOutputSchema
>;

export async function gradeWrittenAnswer(
  input: GradeWrittenAnswerInput
): Promise<GradeWrittenAnswerOutput> {
  return gradeWrittenAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeWrittenAnswerPrompt',
  input: { schema: GradeWrittenAnswerInputSchema },
  output: { schema: GradeWrittenAnswerOutputSchema },
  prompt: `You are an expert AQA GCSE Science examiner with a friendly and encouraging tone. Your task is to mark a student's answer against the provided mark scheme.

You must provide detailed, constructive feedback formatted in HTML. Do not just say if the answer is right or wrong. Explain *why*.

Your feedback should follow this structure:
1.  Start with a positive and encouraging opening.
2.  Create a <ul> list. For each point in the mark scheme, create a <li>.
3.  Inside each <li>, state the marking point. Then, say whether the student's answer achieved this point. Use a "✅" emoji if they got the point and a "❌" if they missed it.
4.  Provide a brief quote or explanation of why they did or did not get the mark.
5.  After the list, provide a summary of how they could improve.
6.  Finally, determine the total marks awarded.

Example response for a 2-mark question:
"<p>Great effort! Here's a breakdown of your answer:</p>
<ul>
    <li>✅ <strong>Marking Point:</strong> The student correctly identified that enzymes act as catalysts. <strong>Your Answer:</strong> You mentioned that 'enzymes speed up reactions', which is a perfect way to put it.</li>
    <li>❌ <strong>Marking Point:</strong> The student did not mention that enzymes are proteins. <strong>Your Answer:</strong> You explained what enzymes do, but didn't mention what they are made of.</li>
</ul>
<p><strong>To improve:</strong> Next time, remember to also state that enzymes are a type of protein to secure that second mark. Well done on the first point!</p>"

Here is the information:
Question: "{{{question}}}"
Marks available: {{{marks}}}
Mark Scheme: "{{{markScheme}}}"
Student's Answer: "{{{userAnswer}}}"
`,
});

const gradeWrittenAnswerFlow = ai.defineFlow(
  {
    name: 'gradeWrittenAnswerFlow',
    inputSchema: GradeWrittenAnswerInputSchema,
    outputSchema: GradeWrittenAnswerOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('Generated grading output was empty.');
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
    throw new Error('Failed to grade answer after multiple retries.');
  }
);
