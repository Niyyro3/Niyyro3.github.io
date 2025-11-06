
'use server';
/**
 * @fileOverview A flow for generating a full, interactive lesson on a given topic.
 * This flow acts like an expert teacher, using various techniques to create a comprehensive learning experience.
 *
 * - generateLesson - The main function to generate the lesson.
 * - GenerateLessonInput - The input type for the function.
 * - GenerateLessonOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchYoutube } from '../tools/youtube-search';

const MultipleChoiceQuizSchema = z.object({
  quizType: z.enum(['multiple-choice']),
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z
    .union([z.string(), z.array(z.string())])
    .describe(
      'The correct answer or an array of correct answers if there are multiple.'
    ),
});

const WrittenQuestionQuizSchema = z.object({
  quizType: z.enum(['written-question']),
  question: z.string().describe('The open-ended exam-style question.'),
  marks: z
    .number()
    .min(1)
    .max(4)
    .describe('The number of marks the question is worth (1-4).'),
  answer: z
    .string()
    .describe(
      'A concise, ideal answer to the question that can be used for checking.'
    ),
});

const FillInTheBlanksQuizSchema = z.object({
  quizType: z.enum(['fill-in-the-blanks']),
  sentence: z
    .string()
    .describe(
      'A sentence with a key term replaced by "______" (six underscores).'
    ),
  answer: z.string().describe('The word that was removed from the sentence.'),
});

const LessonSlideSchema = z.object({
  title: z
    .string()
    .describe('A short, engaging title for this section of the lesson.'),
  content: z
    .string()
    .describe(
      'The main educational content for this slide, formatted as HTML. This should be detailed and well-explained.'
    ),
  quiz: z
    .union([
      MultipleChoiceQuizSchema,
      WrittenQuestionQuizSchema,
      FillInTheBlanksQuizSchema,
    ])
    .describe(
      'A quiz question to test understanding of the content on this slide. This can be multiple-choice, a written question, or fill-in-the-blanks.'
    ),
  videoUrl: z.string().optional().describe('A relevant YouTube video URL for this slide.'),
});

const GenerateLessonInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or subject matter for which to generate the lesson.'),
});
export type GenerateLessonInput = z.infer<typeof GenerateLessonInputSchema>;

const GenerateLessonOutputSchema = z.object({
  title: z.string().describe('The overall title of the lesson.'),
  objectives: z
    .array(z.string())
    .describe('A list of clear learning objectives for the lesson.'),
  introduction: z
    .string()
    .describe('An engaging introduction to the topic, formatted as HTML.'),
  slides: z
    .array(LessonSlideSchema)
    .describe(
      'An array of lesson "slides", each covering a part of the topic.'
    ),
  summary: z
    .string()
    .describe(
      'A final summary of the key points of the lesson, formatted as HTML.'
    ),
});
export type GenerateLessonOutput = z.infer<typeof GenerateLessonOutputSchema>;

// The main exported function to be called from the application.
export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonOutput> {
  const lessonPlan = await generateLessonFlow(input);
  return lessonPlan;
}

// The prompt definition for the AI model to generate the lesson plan.
const lessonPrompt = ai.definePrompt({
  name: 'generateLessonPrompt',
  input: { schema: GenerateLessonInputSchema },
  output: { schema: GenerateLessonOutputSchema },
  tools: [searchYoutube],
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert Edexcel GCSE History teacher. Your task is to create a complete, engaging, and detailed lesson plan for the given topic, ensuring all content is strictly aligned with the Edexcel GCSE History curriculum. You must use effective teaching techniques to help a student learn and retain information.

Topic: {{{topic}}}

Structure the lesson as follows:
1.  **Title:** A clear, concise title for the lesson.
2.  **Learning Objectives:** Create a list of 3-4 specific, measurable learning objectives from the Edexcel syllabus.
3.  **Introduction:** Write an engaging introduction. Use an analogy or a real-world example to connect the topic to something the student already knows.
4.  **Slides:** Break the main content into 5-7 distinct "slides". Each slide must have:
    *   A **title**.
    *   Detailed **content** explaining a core concept, formatted in simple HTML (using <h2>, <h3>, <p>, <ul>, <li>, <strong>).
    *   A **quiz** to check for understanding. You MUST vary the quiz type on each slide, choosing randomly between 'multiple-choice', 'written-question', and 'fill-in-the-blanks'.
        - For 'multiple-choice', occasionally use multiple correct answers.
        - For 'written-question', keep it concise (2-4 marks).
        - For 'fill-in-the-blanks', use "______" for the blank space.
    *   **Video:** For each slide, use the searchYoutube tool to find a short, relevant video clip from either 'Mr. Allsop History', 'History Bombs' or 'Simple History' that explains the concept on the slide. Add the URL to the 'videoUrl' field.
5.  **Summary:** Conclude with a summary of the most crucial points from the lesson.

**Teaching Style & Formatting:**
*   Be clear, encouraging, and easy to understand for a 15-16 year old.
*   Break down complex ideas into simple, manageable steps.
*   Wrap all key historical terms, people, and dates in <strong> tags.

Generate the lesson plan based on these instructions.`,
});

// The main Genkit flow that orchestrates the lesson generation.
const generateLessonFlow = ai.defineFlow(
  {
    name: 'generateLessonFlow',
    inputSchema: GenerateLessonInputSchema,
    outputSchema: GenerateLessonOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const { output } = await lessonPrompt(input);
        if (output) {
          return output;
        }
        // If output is null or undefined, treat it as an error to trigger a retry
        throw new Error('Generated lesson output was empty.');
      } catch (error: any) {
        retries++;
        console.log(`Attempt ${retries} failed. Retrying...`, error);
        if (retries >= maxRetries) {
          // If we've exhausted retries, throw the last error
          throw new Error('Failed to generate lesson after multiple retries.');
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1500 * retries));
      }
    }
    // This line should not be reachable, but as a fallback, we throw an error.
    throw new Error('Failed to generate lesson after multiple retries.');
  }
);
