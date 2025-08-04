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
  prompt: `You are an expert YouTube video summarizer. You can create bullet point summaries from either video transcripts or video metadata (title, description, tags, etc.).

When given a transcript, create a detailed summary of the video content.
When given metadata only, create a summary based on the available information and make it clear that it's based on limited data.

Title: {{{videoTitle}}}

Content (transcript or metadata): {{{transcript}}}

Instructions:
- Create 3-5 bullet points summarizing the key information
- If working from metadata only, start with "• Based on video metadata:"
- Focus on the most important aspects of the video
- Keep each bullet point concise but informative

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
      
      // If it's a service overload error, try again with a delay
      if (error.message?.includes('overloaded') || error.status === 503) {
        console.log('AI service overloaded, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const {output} = await prompt(input);
          return output!;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      
      // If all else fails, return a simple summary based on the transcript
      const transcriptLines = input.transcript.split('\n').filter(line => line.trim().length > 0);
      const keyPoints = transcriptLines.slice(0, 5).map(line => `• ${line.trim()}`);
      
      return {
        summary: keyPoints.join('\n') + '\n\n• Summary generated from transcript (AI service temporarily unavailable)'
      };
    }
  }
);
