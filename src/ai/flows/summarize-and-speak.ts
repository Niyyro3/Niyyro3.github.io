
'use server';
/**
 * @fileOverview A flow for summarizing content and generating a spoken podcast from it.
 *
 * - summarizeAndSpeak - The main function to generate the audio summary.
 * - SummarizeAndSpeakInput - The input type for the function.
 * - SummarizeAndSpeakOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const SummarizeAndSpeakInputSchema = z.object({
  content: z.string().describe('The full text content to be summarized and converted to speech.'),
  topic: z.string().describe('The topic of the content, used for context in the summary.'),
});
export type SummarizeAndSpeakInput = z.infer<typeof SummarizeAndSpeakInputSchema>;

const SummarizeAndSpeakOutputSchema = z.object({
  audio: z.string().describe('The base64 encoded WAV audio data URI of the summarized podcast.'),
});
export type SummarizeAndSpeakOutput = z.infer<typeof SummarizeAndSpeakOutputSchema>;

// Utility to convert raw PCM audio buffer to a WAV file (as a base64 string)
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const summarizeAndSpeakFlow = ai.defineFlow(
  {
    name: 'summarizeAndSpeakFlow',
    inputSchema: SummarizeAndSpeakInputSchema,
    outputSchema: SummarizeAndSpeakOutputSchema,
  },
  async ({ content, topic }) => {
    let retries = 0;
    const maxRetries = 2;
    let script: string | undefined;

    // Step 1: Summarize the content into a podcast script
    while (retries <= maxRetries) {
        try {
            const summaryResponse = await ai.generate({
              prompt: `You are an expert science communicator. Your task is to take the following raw lesson content about "${topic}" and turn it into a clear and concise podcast script. The script should flow naturally as spoken audio. Explain the core concepts and finish with a quick summary of the key takeaways. Be brief.
        
              Raw Content:
              \`\`\`
              ${content}
              \`\`\`
              `,
               output: {
                schema: z.object({
                  script: z.string().describe('The generated podcast script.'),
                }),
              },
            });
            script = summaryResponse.output?.script;
            if (script) break; // Exit loop if successful
        } catch (error: any) {
            retries++;
            if (retries > maxRetries) {
              console.error('Final summary attempt failed:', error);
              throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
    }

    if (!script) {
      throw new Error('Failed to generate a summary script after multiple retries.');
    }
    
    // Step 2: Convert the generated script to audio
    retries = 0; // Reset retries for the next step
    while (retries <= maxRetries) {
      try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          prompt: script,
        });

        if (!media) {
          throw new Error('no media returned from TTS model');
        }

        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        const wavData = await toWav(audioBuffer);

        return {
          audio: 'data:audio/wav;base64,' + wavData,
        };
      } catch (error: any) {
        retries++;
        if (retries > maxRetries) {
          console.error('Final speech generation attempt failed:', error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
     throw new Error('Failed to generate speech after multiple retries.');
  }
);


export async function summarizeAndSpeak(
  input: SummarizeAndSpeakInput
): Promise<SummarizeAndSpeakOutput> {
  return summarizeAndSpeakFlow(input);
}
