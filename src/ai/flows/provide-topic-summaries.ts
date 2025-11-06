
'use server';
/**
 * @fileOverview A flow for generating summaries of science topics.
 *
 * - provideTopicSummary - A function that generates a summary for a given topic.
 * - ProvideTopicSummaryInput - The input type for the provideTopicsummary function.
 * - ProvideTopicSummaryOutput - The return type for the provideTopicsummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideTopicSummaryInputSchema = z.object({
  topic: z.string().describe('The topic to summarize.'),
});
export type ProvideTopicSummaryInput = z.infer<typeof ProvideTopicSummaryInputSchema>;

const ProvideTopicSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the topic, formatted with HTML for rich text display.'),
});
export type ProvideTopicSummaryOutput = z.infer<typeof ProvideTopicSummaryOutputSchema>;

export async function provideTopicSummary(input: ProvideTopicSummaryInput): Promise<ProvideTopicSummaryOutput> {
  return provideTopicSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideTopicSummaryPrompt',
  input: {schema: ProvideTopicSummaryInputSchema},
  output: {schema: ProvideTopicSummaryOutputSchema},
  prompt: `You are an expert Edexcel GCSE History tutor creating a revision guide summary for a student.

Your task is to provide a detailed and comprehensive summary for the given topic, focusing only on the most crucial, must-know information from the Edexcel syllabus. The summary should be clear, concise, and easy to understand. The output MUST be a single string containing valid HTML.

Your expertise covers the following topics:
- Superpower Relations and the Cold War
- Weimar and Nazi Germany
- Medicine in Britain, c.1250-present
- Anglo-Saxon England and the Norman Conquest (1060-66)

Please structure the summary logically into the following three sections, using HTML tags:
1.  **<h2>Key People</h2>**: Use a <ul> with <li> for each person, detailing their significance.
2.  **<h2>Key Events</h2>**: Use a <ul> with <li> for each event, explaining what happened and why it was important.
3.  **<h2>Key Dates</h2>**: Use a <ul> with <li> for each key date, briefly stating the event.

Crucially, you MUST wrap all key historical terms, people, and dates in <strong> tags to make them bold.

Example:
"<h2>Key People</h2>
<ul>
  <li><strong>Winston Churchill</strong>: The Prime Minister of Britain...</li>
</ul>
<h2>Key Events</h2>
<ul>
  <li>The <strong>Treaty of Versailles</strong>: Signed in <strong>1919</strong>, it was a key cause of resentment in Germany. One of its most significant terms was the <strong>War Guilt Clause</strong>.</li>
</ul>"

Do not include conversational filler. Get straight to the point, but ensure the explanations are thorough enough for a student to revise from.

Topic: {{{topic}}}`,
});

const provideTopicSummaryFlow = ai.defineFlow(
  {
    name: 'provideTopicSummaryFlow',
    inputSchema: ProvideTopicSummaryInputSchema,
    outputSchema: ProvideTopicSummaryOutputSchema,
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
        throw new Error('Generated summary was empty.');
      } catch (error: any) {
         retries++;
        if (retries > maxRetries) {
          console.error('Final attempt failed:', error);
          throw new Error('Failed to generate summary after multiple retries.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
    throw new Error('Failed to generate summary after multiple retries.');
  }
);
