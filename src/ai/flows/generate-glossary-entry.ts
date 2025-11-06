
'use server';
/**
 * @fileOverview A flow for generating a visual glossary entry.
 *
 * - generateGlossaryEntry - A function that generates a definition and a diagram.
 * - GenerateGlossaryEntryInput - The input type for the function.
 * - GenerateGlossaryEntryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { provideTopicSummary } from './provide-topic-summaries';


const GenerateGlossaryEntryInputSchema = z.object({
  term: z.string().describe('The scientific term to be defined and illustrated.'),
});
export type GenerateGlossaryEntryInput = z.infer<typeof GenerateGlossaryEntryInputSchema>;

const GenerateGlossaryEntryOutputSchema = z.object({
  explanation: z.string().describe('A clear, concise explanation of the term suitable for a GCSE student.'),
});
export type GenerateGlossaryEntryOutput = z.infer<typeof GenerateGlossaryEntryOutputSchema>;

export async function generateGlossaryEntry(
  input: GenerateGlossaryEntryInput
): Promise<GenerateGlossaryEntryOutput> {
  const result = await provideTopicSummary({ topic: input.term });
  return { explanation: result.summary };
}
