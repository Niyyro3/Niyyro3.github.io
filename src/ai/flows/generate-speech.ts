
'use server';
/**
 * @fileOverview A flow for generating speech from text content.
 *
 * - generateSpeech - The main function to generate audio.
 * - GenerateSpeechInput - The input type for the function.
 * - GenerateSpeechOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  audio: z.string().describe('The base64 encoded WAV audio data URI.'),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

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

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async ({ text }) => {
    let retries = 0;
    const maxRetries = 2;

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
          prompt: text,
        });

        if (!media) {
          throw new Error('no media returned');
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
          console.error('Final attempt failed:', error);
          throw new Error('Failed to generate speech after multiple retries.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
     throw new Error('Failed to generate speech after multiple retries.');
  }
);

export async function generateSpeech(
  input: GenerateSpeechInput
): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}
