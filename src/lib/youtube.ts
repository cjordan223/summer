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
      console.log('🔍 Fetching subscribed channels from YouTube API...');
      
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
        console.error('❌ YouTube API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 YouTube API response:', {
        totalResults: data.pageInfo?.totalResults,
        resultsPerPage: data.pageInfo?.resultsPerPage,
        itemsCount: data.items?.length
      });
      
      const channels = data.items.map((item: any) => ({
        id: item.snippet.resourceId.channelId,
        name: item.snippet.title,
        avatarUrl: item.snippet.thumbnails?.default?.url || 'https://placehold.co/40x40.png',
        avatarHint: item.snippet.title.toLowerCase().replace(/\s+/g, ' '),
        enabled: true, // Default to enabled
      }));
      
      console.log('✅ Successfully fetched channels:', channels.length);
      return channels;
    } catch (error) {
      console.error('❌ Error fetching subscribed channels:', error);
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

  // Get video transcript using youtube-transcript
  async getVideoTranscript(videoId: string): Promise<VideoTranscript | null> {
    try {
      // Dynamic import to avoid SSR issues
      const { YoutubeTranscript } = await import('youtube-transcript');
      
      console.log(`🎬 Fetching transcript for video: ${videoId}`);
      
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptItems || transcriptItems.length === 0) {
        console.warn(`❌ No transcript found for video: ${videoId}`);
        return null;
      }
      
      // Combine all transcript items into a single text
      const transcriptText = transcriptItems
        .map(item => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`✅ Transcript fetched successfully. Length: ${transcriptText.length} characters`);
      
      return {
        text: transcriptText,
        language: 'en' // Most transcripts are in English
      };
    } catch (error) {
      console.error(`❌ Error fetching transcript for video ${videoId}:`, error);
      return null;
    }
  }

  // Get alternative content for videos without transcripts
  async getVideoAlternativeContent(videoId: string, videoTitle: string, channelName: string): Promise<string> {
    try {
      console.log(`📄 Fetching alternative content for video: ${videoId}`);
      
      // Try to get video details from YouTube API
      const videoDetails = await this.getVideoDetails(videoId);
      
      let content = `Video Title: ${videoTitle}\n`;
      content += `Channel: ${channelName}\n`;
      
      if (videoDetails) {
        content += `Duration: ${videoDetails.duration}\n`;
        content += `Category: ${videoDetails.category}\n`;
        content += `Tags: ${videoDetails.tags?.join(', ') || 'None'}\n`;
        content += `Description: ${videoDetails.description || 'No description available'}\n`;
      }
      
      // Add some context based on the video title
      content += `\nContext: This appears to be a video about ${this.extractTopicFromTitle(videoTitle)}. `;
      content += `Based on the title and channel information, this video likely covers topics related to ${channelName}'s typical content.`;
      
      console.log(`✅ Alternative content generated. Length: ${content.length} characters`);
      return content;
      
    } catch (error) {
      console.error(`❌ Error generating alternative content:`, error);
      return this.getFallbackContent(videoTitle, channelName);
    }
  }

  // Get video details from YouTube API
  private async getVideoDetails(videoId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch video details: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        return {
          duration: this.formatDuration(video.contentDetails.duration),
          category: video.snippet.categoryId,
          tags: video.snippet.tags,
          description: video.snippet.description,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }

  // Extract topic from video title
  private extractTopicFromTitle(title: string): string {
    const commonTopics = [
      'tutorial', 'guide', 'review', 'comparison', 'unboxing', 'setup',
      'coding', 'programming', 'development', 'design', 'art', 'music',
      'gaming', 'tech', 'technology', 'science', 'education', 'news',
      'vlog', 'podcast', 'interview', 'lecture', 'presentation'
    ];
    
    const lowerTitle = title.toLowerCase();
    for (const topic of commonTopics) {
      if (lowerTitle.includes(topic)) {
        return topic;
      }
    }
    
    return 'general content';
  }

  // Format duration from ISO 8601 format
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Unknown';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes.padStart(2, '0')}:`;
    result += seconds.padStart(2, '0');
    
    return result;
  }

  // Fallback content when all else fails
  private getFallbackContent(videoTitle: string, channelName: string): string {
    return `Video Title: ${videoTitle}
Channel: ${channelName}
Content Type: Video content from ${channelName}
Description: This video appears to be content from the ${channelName} channel. The title suggests it covers topics related to ${this.extractTopicFromTitle(videoTitle)}. Without a transcript or detailed description, this summary is based on the available metadata and channel context.`;
  }

  // Get videos from multiple channels
  async getVideosFromChannels(channelIds: string[]): Promise<YouTubeVideo[]> {
    console.log('🎬 Fetching videos from channels:', channelIds.length);
    const allVideos: YouTubeVideo[] = [];
    
    for (const channelId of channelIds) {
      try {
        console.log(`📺 Fetching videos for channel: ${channelId}`);
        const videos = await this.getChannelVideos(channelId, 5);
        console.log(`✅ Got ${videos.length} videos from channel ${channelId}`);
        allVideos.push(...videos);
      } catch (error) {
        console.error(`❌ Error fetching videos for channel ${channelId}:`, error);
      }
    }

    console.log(`📊 Total videos collected: ${allVideos.length}`);
    
    // Sort by published date (newest first)
    const sortedVideos = allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    console.log('📅 Videos sorted by date (newest first)');
    return sortedVideos;
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

  // Mock data fallbacks for development
  private getMockChannels(): YouTubeChannel[] {
    return [
      { id: '1', name: 'Marques Brownlee', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man tech', enabled: true },
      { id: '2', name: 'MrBeast', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man fun', enabled: true },
      { id: '3', name: 'Lex Fridman', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man podcast', enabled: false },
      { id: '4', name: 'Fireship', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'code fire', enabled: true },
      { id: '5', name: 'Veritasium', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'science man', enabled: true },
    ];
  }
}

export const youtubeAPI = new YouTubeAPI(); 