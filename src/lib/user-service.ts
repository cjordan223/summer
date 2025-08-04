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
      console.log(`🤖 Generating AI summary for: ${video.title}`);
      
      // Check if summary already exists
      const existingSummary = await this.getSummaryByVideoId(userId, video.id);
      if (existingSummary) {
        console.log(`✅ Summary already exists for: ${video.title}`);
        return existingSummary;
      }

      // Get video transcript or alternative content
      const transcript = await youtubeAPI.getVideoTranscript(video.id);
      let content: string;
      
      if (transcript) {
        console.log(`📄 Using transcript (${transcript.text.length} characters)`);
        content = transcript.text;
      } else {
        console.log(`📄 Using alternative content for: ${video.title}`);
        content = await youtubeAPI.getVideoAlternativeContent(video.id, video.title, video.channelName);
      }
      
      // Generate AI summary
      console.log(`🚀 Calling AI API for: ${video.title}`);
      
      try {
        const { summarizeVideo } = await import('@/ai/flows/summarize-video');
        const aiSummary = await summarizeVideo({
          transcript: content,
          videoTitle: video.title
        });
        
        console.log(`✅ AI summary generated successfully`);
        
        // Create and save summary
        const summary = this.createSummaryObject(video, aiSummary.summary);
        await this.saveSummary(userId, summary);
        
        return summary;
      } catch (aiError) {
        console.error('❌ AI summary generation failed:', aiError);
        
        // Create fallback summary
        const fallbackSummary = {
          summary: `• Summary generation failed for: ${video.title}\n• Please try again later`
        };
        
        const summary = this.createSummaryObject(video, fallbackSummary.summary);
        await this.saveSummary(userId, summary);
        
        return summary;
      }
    } catch (error) {
      console.error('Error generating video summary:', error);
      return null;
    }
  }

  // Helper method to create summary object
  private createSummaryObject(video: YouTubeVideo, summaryText: string): UserSummary {
    return {
      id: `${video.id}_${Date.now()}`,
      videoId: video.id,
      videoTitle: video.title,
      channelName: video.channelName,
      thumbnailUrl: video.thumbnailUrl,
      thumbnailHint: video.thumbnailHint,
      summaryPoints: summaryText.split('\n').filter(point => point.trim().length > 0),
      publishedAt: video.publishedAt,
      channelAvatarUrl: 'https://placehold.co/40x40.png',
      channelAvatarHint: video.channelName.toLowerCase().replace(/\s+/g, ' '),
      createdAt: new Date(),
    };
  }

  // Helper method to save summary to localStorage
  private async saveSummary(userId: string, summary: UserSummary): Promise<void> {
    const storageKey = this.getStorageKey(userId, 'summaries');
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { summaries: [] };
    data.summaries.push({
      ...summary,
      createdAt: summary.createdAt.toISOString(),
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
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
      console.log('🔄 Starting channel sync for user:', userId);
      
      // Get user's current channels
      const currentChannels = await this.getUserChannels(userId);
      console.log('📺 Current channels in storage:', currentChannels.length);
      
      // Fetch subscribed channels from YouTube
      const subscribedChannels = await youtubeAPI.getSubscribedChannels(accessToken);
      console.log('📡 Fetched subscribed channels from YouTube:', subscribedChannels.length);
      console.log('📋 Channel names:', subscribedChannels.map(c => c.name).slice(0, 5), '...');
      
      // Merge with existing preferences
      const mergedChannels = subscribedChannels.map(subChannel => {
        const existing = currentChannels.find(c => c.id === subChannel.id);
        return existing ? { ...subChannel, enabled: existing.enabled } : subChannel;
      });
      
      // Save updated channels
      await this.saveUserChannels(userId, mergedChannels);
      console.log('💾 Saved merged channels to storage');
      
      // Get enabled channel IDs
      const enabledChannelIds = mergedChannels
        .filter(channel => channel.enabled)
        .map(channel => channel.id);
      console.log('✅ Enabled channels:', enabledChannelIds.length);
      console.log('🎯 Enabled channel names:', mergedChannels.filter(c => c.enabled).map(c => c.name));
      
      // Fetch recent videos from enabled channels
      const videos = await youtubeAPI.getVideosFromChannels(enabledChannelIds);
      console.log('🎬 Total videos fetched from all channels:', videos.length);
      
      // Log video details for first few videos
      videos.slice(0, 3).forEach((video, index) => {
        console.log(`🎥 Video ${index + 1}:`, {
          title: video.title,
          channel: video.channelName,
          published: video.publishedAt,
          id: video.id
        });
      });
      
      if (videos.length > 10) {
        console.log(`⚠️  Found ${videos.length} videos, but only processing first 10 to avoid rate limits`);
      }
      
      // Generate summaries for new videos
      const videosToProcess = videos.slice(0, 10);
      console.log(`🚀 Processing ${videosToProcess.length} videos for AI summaries`);
      
      for (const video of videosToProcess) {
        console.log(`📝 Processing video: ${video.title} (${video.channelName})`);
        await this.generateVideoSummary(userId, video);
      }
      
      // If no videos were found, show a message
      if (videos.length === 0) {
        console.log('❌ No recent videos found from monitored channels');
      } else {
        console.log(`✅ Successfully processed ${videosToProcess.length} videos`);
      }
    } catch (error) {
      console.error('❌ Error syncing user channels:', error);
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