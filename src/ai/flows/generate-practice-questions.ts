
'use server';

/**
 * @fileOverview A flow for generating practice questions based on user performance.
 *
 * - generatePracticeQuestions - A function that generates practice questions based on user performance.
 * - GeneratePracticeQuestionsInput - The input type for the generatePracticeQuestions function.
 * - GeneratePracticeQuestionsOutput - The return type for the generatePracticeQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultipleChoiceQuestionSchema = z.object({
  quizType: z.enum(['multiple-choice']),
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer from the options array.'),
});

const WrittenQuestionSchema = z.object({
    quizType: z.enum(['written-question']),
    question: z.string().describe('The open-ended exam-style question.'),
    marks: z.number().min(1).max(6).describe('The number of marks the question is worth (1-6).'),
    answer: z.string().describe('A concise, ideal answer to the question that can be used for checking.'),
});

const FillInTheBlanksQuestionSchema = z.object({
    quizType: z.enum(['fill-in-the-gaps']),
    sentence: z.string().describe('A sentence with a key term replaced by "______" (six underscores).'),
    answer: z.string().describe('The word that was removed from the sentence.'),
});

const QuestionSchema = z.union([
    MultipleChoiceQuestionSchema,
    WrittenQuestionSchema,
    FillInTheBlanksQuestionSchema,
]);

const GeneratePracticeQuestionsInputSchema = z.object({
  topic: z.string().describe('A comma-separated list of science topics to generate questions for, e.g., "B1: Cell Biology, B4: Bioenergetics"'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the questions.'),
  performanceSummary: z
    .string()
    .describe(
      'A summary of the user performance on previous quizzes and revision activities, including areas of weakness.'
    ),
  questionCount: z.number().int().min(1).max(10).default(10).describe('The number of questions to generate.'),
});
export type GeneratePracticeQuestionsInput = z.infer<typeof GeneratePracticeQuestionsInputSchema>;

const GeneratePracticeQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of practice questions.'),
});
export type GeneratePracticeQuestionsOutput = z.infer<typeof GeneratePracticeQuestionsOutputSchema>;

export async function generatePracticeQuestions(
  input: GeneratePracticeQuestionsInput
): Promise<GeneratePracticeQuestionsOutput> {
  return generatePracticeQuestionsFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: {schema: GeneratePracticeQuestionsInputSchema},
  output: {schema: GeneratePracticeQuestionsOutputSchema},
  prompt: `You are an expert AQA GCSE Science examiner. Your task is to create a practice exam paper.
You MUST generate {{questionCount}} practice questions on the following topics: {{topic}}.
The difficulty of the paper should be {{difficulty}}.

Crucially, the questions you generate should be based on the style and content of real past AQA GCSE exam papers.

You MUST generate a mix of different question types. Include 'multiple-choice', 'written-question' and 'fill-in-the-gaps' questions to create a varied mock exam paper.
Ensure some of the written questions are for higher marks (4-6 marks) to properly challenge the student.

The user has provided the following context, but you should prioritize generating questions based on the selected topics:
User Context: {{{performanceSummary}}}
`,
});

const generatePracticeQuestionsFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuestionsFlow',
    inputSchema: GeneratePracticeQuestionsInputSchema,
    outputSchema: GeneratePracticeQuestionsOutputSchema,
  },
  async input => {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { output } = await practiceQuestionPrompt(input);
        if (!output) {
          throw new Error('Generated practice questions output was empty.');
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
    throw new Error('Failed to generate practice questions after multiple retries.');
  }
);
