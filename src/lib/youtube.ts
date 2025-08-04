// YouTube API service for fetching channels, videos, and transcripts

export interface YouTubeChannel {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
  enabled: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  publishedAt: string;
  description: string;
}

export interface VideoTranscript {
  text: string;
  language: string;
}

class YouTubeAPI {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Please set NEXT_PUBLIC_YOUTUBE_API_KEY');
    }
  }

  // Get user's subscribed channels
  async getSubscribedChannels(accessToken: string): Promise<YouTubeChannel[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/subscriptions?part=snippet&mine=true&maxResults=50&key=${this.apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.snippet.resourceId.channelId,
        name: item.snippet.title,
        avatarUrl: item.snippet.thumbnails?.default?.url || 'https://placehold.co/40x40.png',
        avatarHint: item.snippet.title.toLowerCase().replace(/\s+/g, ' '),
        enabled: true, // Default to enabled
      }));
    } catch (error) {
      console.error('Error fetching subscribed channels:', error);
      // Return mock data as fallback
      return this.getMockChannels();
    }
  }

  // Get recent videos from a channel
  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch channel videos: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || 'https://placehold.co/600x400.png',
        thumbnailHint: item.snippet.title.toLowerCase().replace(/\s+/g, ' '),
        publishedAt: this.formatPublishedDate(item.snippet.publishedAt),
        description: item.snippet.description,
      }));
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      return [];
    }
  }

  // Get video transcript (this is a simplified version - real implementation would need more complex logic)
  async getVideoTranscript(videoId: string): Promise<VideoTranscript | null> {
    try {
      // Note: YouTube doesn't provide transcripts via their public API
      // This would typically require:
      // 1. Scraping the video page for captions
      // 2. Using a third-party service
      // 3. Or using YouTube's internal APIs (requires special access)
      
      // For now, we'll return a mock transcript
      return this.getMockTranscript(videoId);
    } catch (error) {
      console.error('Error fetching video transcript:', error);
      return null;
    }
  }

  // Get videos from multiple channels
  async getVideosFromChannels(channelIds: string[]): Promise<YouTubeVideo[]> {
    const allVideos: YouTubeVideo[] = [];
    
    for (const channelId of channelIds) {
      try {
        const videos = await this.getChannelVideos(channelId, 5);
        allVideos.push(...videos);
      } catch (error) {
        console.error(`Error fetching videos for channel ${channelId}:`, error);
      }
    }

    // Sort by published date (newest first)
    return allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  // Helper method to format published date
  private formatPublishedDate(publishedAt: string): string {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return '1 day ago';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  }

  // Mock data fallbacks
  private getMockChannels(): YouTubeChannel[] {
    return [
      { id: '1', name: 'Marques Brownlee', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man tech', enabled: true },
      { id: '2', name: 'MrBeast', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man fun', enabled: true },
      { id: '3', name: 'Lex Fridman', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man podcast', enabled: false },
      { id: '4', name: 'Fireship', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'code fire', enabled: true },
      { id: '5', name: 'Veritasium', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'science man', enabled: true },
    ];
  }

  private getMockTranscript(videoId: string): VideoTranscript {
    return {
      text: `This is a mock transcript for video ${videoId}. In a real implementation, this would contain the actual transcript from the YouTube video. The transcript would be used by the AI to generate a summary of the video content.`,
      language: 'en'
    };
  }
}

export const youtubeAPI = new YouTubeAPI(); 