'use client';

import { youtubeAPI, YouTubeChannel, YouTubeVideo } from './youtube';
import { summarizeVideo } from '@/ai/flows/summarize-video';

export interface UserSummary {
  id: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  summaryPoints: string[];
  publishedAt: string;
  channelAvatarUrl: string;
  channelAvatarHint: string;
  createdAt: Date;
}

export interface UserPreferences {
  enabledChannels: string[];
  summaryFrequency: 'daily' | 'weekly' | 'manual';
  lastSync: Date | null;
}

class UserService {
  private getStorageKey(userId: string, type: string): string {
    return `summer_${userId}_${type}`;
  }

  // Get user's channel preferences
  async getUserChannels(userId: string): Promise<YouTubeChannel[]> {
    try {
      const storageKey = this.getStorageKey(userId, 'channels');
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        return data.channels || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user channels:', error);
      return [];
    }
  }

  // Save user's channel preferences
  async saveUserChannels(userId: string, channels: YouTubeChannel[]): Promise<void> {
    try {
      const storageKey = this.getStorageKey(userId, 'channels');
      const data = {
        channels,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user channels:', error);
      throw error;
    }
  }

  // Toggle channel monitoring
  async toggleChannel(userId: string, channelId: string, enabled: boolean): Promise<void> {
    try {
      const channels = await this.getUserChannels(userId);
      
      const updatedChannels = channels.map((channel: YouTubeChannel) =>
        channel.id === channelId ? { ...channel, enabled } : channel
      );
      
      await this.saveUserChannels(userId, updatedChannels);
    } catch (error) {
      console.error('Error toggling channel:', error);
      throw error;
    }
  }

  // Get user's summaries
  async getUserSummaries(userId: string, limit: number = 20): Promise<UserSummary[]> {
    try {
      const storageKey = this.getStorageKey(userId, 'summaries');
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        const summaries: UserSummary[] = data.summaries || [];
        
        // Sort by creation date (newest first)
        return summaries
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user summaries:', error);
      return [];
    }
  }

  // Generate summary for a video
  async generateVideoSummary(userId: string, video: YouTubeVideo): Promise<UserSummary | null> {
    try {
      // Check if summary already exists
      const existingSummary = await this.getSummaryByVideoId(userId, video.id);
      if (existingSummary) {
        return existingSummary;
      }

      // Get video transcript
      const transcript = await youtubeAPI.getVideoTranscript(video.id);
      if (!transcript) {
        console.warn('No transcript available for video:', video.id);
        return null;
      }

      // Generate AI summary
      let aiSummary;
      try {
        aiSummary = await summarizeVideo({
          transcript: transcript.text,
          videoTitle: video.title,
        });
      } catch (error) {
        console.error('Error generating AI summary:', error);
        // Fallback summary
        aiSummary = {
          summary: `• ${video.title} - Summary generation failed.\n• This could be due to AI service overload or transcript issues.\n• Please try again later.`
        };
      }

      // Create summary object
      const summary: UserSummary = {
        id: `${video.id}_${Date.now()}`, // Simple ID generation
        videoId: video.id,
        videoTitle: video.title,
        channelName: video.channelName,
        thumbnailUrl: video.thumbnailUrl,
        thumbnailHint: video.thumbnailHint,
        summaryPoints: aiSummary.summary.split('\n').filter(point => point.trim().length > 0),
        publishedAt: video.publishedAt,
        channelAvatarUrl: 'https://placehold.co/40x40.png', // Would need to fetch from channel data
        channelAvatarHint: video.channelName.toLowerCase().replace(/\s+/g, ' '),
        createdAt: new Date(),
      };

      // Save to localStorage
      const storageKey = this.getStorageKey(userId, 'summaries');
      const stored = localStorage.getItem(storageKey);
      const data = stored ? JSON.parse(stored) : { summaries: [] };
      data.summaries.push({
        ...summary,
        createdAt: summary.createdAt.toISOString(),
      });
      localStorage.setItem(storageKey, JSON.stringify(data));

      return summary;
    } catch (error) {
      console.error('Error generating video summary:', error);
      return null;
    }
  }

  // Get summary by video ID
  async getSummaryByVideoId(userId: string, videoId: string): Promise<UserSummary | null> {
    try {
      const summaries = await this.getUserSummaries(userId);
      return summaries.find(summary => summary.videoId === videoId) || null;
    } catch (error) {
      console.error('Error fetching summary by video ID:', error);
      return null;
    }
  }

  // Sync user's channels and generate summaries
  async syncUserChannels(userId: string, accessToken: string): Promise<void> {
    try {
      // Get user's current channels
      const currentChannels = await this.getUserChannels(userId);
      
      // Fetch subscribed channels from YouTube
      const subscribedChannels = await youtubeAPI.getSubscribedChannels(accessToken);
      
      // Merge with existing preferences
      const mergedChannels = subscribedChannels.map(subChannel => {
        const existing = currentChannels.find(c => c.id === subChannel.id);
        return existing ? { ...subChannel, enabled: existing.enabled } : subChannel;
      });
      
      // Save updated channels
      await this.saveUserChannels(userId, mergedChannels);
      
      // Get enabled channel IDs
      const enabledChannelIds = mergedChannels
        .filter(channel => channel.enabled)
        .map(channel => channel.id);
      
      // Fetch recent videos from enabled channels
      const videos = await youtubeAPI.getVideosFromChannels(enabledChannelIds);
      
      // Generate summaries for new videos
      for (const video of videos.slice(0, 10)) { // Limit to 10 videos
        await this.generateVideoSummary(userId, video);
      }
      
      // If no videos were found, create some mock summaries for testing
      if (videos.length === 0) {
        const mockVideos = [
          {
            id: 'mock1',
            title: 'The Future of AI Technology',
            channelName: 'Tech Insights',
            thumbnailUrl: 'https://placehold.co/600x400.png',
            thumbnailHint: 'ai technology',
            publishedAt: '2 days ago',
            description: 'Exploring the latest developments in artificial intelligence.'
          },
          {
            id: 'mock2', 
            title: 'Building Modern Web Applications',
            channelName: 'Code Masters',
            thumbnailUrl: 'https://placehold.co/600x400.png',
            thumbnailHint: 'web development',
            publishedAt: '1 week ago',
            description: 'Learn how to build scalable web applications with modern frameworks.'
          }
        ];
        
        for (const video of mockVideos) {
          await this.generateVideoSummary(userId, video);
        }
      }
    } catch (error) {
      console.error('Error syncing user channels:', error);
      throw error;
    }
  }

  // Delete a summary
  async deleteSummary(userId: string, summaryId: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(userId, 'summaries');
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        data.summaries = data.summaries.filter((summary: UserSummary) => summary.id !== summaryId);
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error deleting summary:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 