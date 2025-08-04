'use server';

/**
 * @fileOverview Summarizes video transcripts into bullet points.
 *
 * - summarizeVideo - A function that handles the video summarization process.
 * - SummarizeVideoInput - The input type for the summarizeVideo function.
 * - SummarizeVideoOutput - The return type for the summarizeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVideoInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the YouTube video to summarize.'),
  videoTitle: z.string().describe('The title of the YouTube video.'),
});
export type SummarizeVideoInput = z.infer<typeof SummarizeVideoInputSchema>;

const SummarizeVideoOutputSchema = z.object({
  summary: z
    .string()
    .describe('A bullet point summary of the YouTube video transcript.'),
});
export type SummarizeVideoOutput = z.infer<typeof SummarizeVideoOutputSchema>;

export async function summarizeVideo(input: SummarizeVideoInput): Promise<SummarizeVideoOutput> {
  return summarizeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeVideoPrompt',
  input: {schema: SummarizeVideoInputSchema},
  output: {schema: SummarizeVideoOutputSchema},
  prompt: `You are an expert YouTube video summarizer. You take a transcript of the video and create a bullet point summary.

Title: {{{videoTitle}}}

Transcript: {{{transcript}}}

Summary:`,
});

const summarizeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeVideoFlow',
    inputSchema: SummarizeVideoInputSchema,
    outputSchema: SummarizeVideoOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('AI summarization error:', error);
      
      // Return a fallback summary if AI service is unavailable
      return {
        summary: `• ${input.videoTitle} - Video summary temporarily unavailable due to AI service overload.\n• Please try again later or check the video directly on YouTube.\n• This is a fallback response while the AI service is being restored.`
      };
    }
  }
);
