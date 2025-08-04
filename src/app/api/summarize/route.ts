import { NextRequest, NextResponse } from 'next/server';
import { summarizeVideo } from '@/ai/flows/summarize-video';
import { youtubeAPI } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoTitle, channelName } = await request.json();

    if (!videoId || !videoTitle) {
      return NextResponse.json(
        { error: 'Missing videoId or videoTitle' },
        { status: 400 }
      );
    }

    console.log(`🎬 Fetching transcript for video: ${videoId}`);
    
    // Try to get the video transcript first
    let transcript = await youtubeAPI.getVideoTranscript(videoId);
    let contentSource = 'transcript';
    
    if (!transcript) {
      console.log(`📄 No transcript available, using alternative content for: ${videoTitle}`);
      
      // Get alternative content (description, metadata, etc.)
      const alternativeContent = await youtubeAPI.getVideoAlternativeContent(videoId, videoTitle, channelName || 'Unknown Channel');
      contentSource = 'metadata';
      
      // Create a mock transcript object for consistency
      transcript = {
        text: alternativeContent,
        language: 'en'
      };
    }

    console.log(`📄 Content length: ${transcript.text.length} characters (source: ${contentSource})`);
    console.log(`🤖 Generating AI summary for: ${videoTitle}`);

    // Generate AI summary using the summarizeVideo flow
    const result = await summarizeVideo({
      transcript: transcript.text,
      videoTitle: videoTitle
    });

    console.log(`✅ AI summary generated successfully`);

    return NextResponse.json({
      success: true,
      summary: result.summary,
      summaryPoints: result.summary.split('\n').filter(point => point.trim().length > 0),
      contentSource: contentSource
    });

  } catch (error) {
    console.error('❌ Error generating AI summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
} 