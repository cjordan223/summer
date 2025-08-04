'use client';

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { youtubeAPI, YouTubeChannel, YouTubeVideo } from './youtube';
import { summarizeVideo } from '@/ai/flows/summarize-video';

const db = getFirestore(firebaseApp);

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
  // Get user's channel preferences
  async getUserChannels(userId: string): Promise<YouTubeChannel[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.channels || [];
      }
      
      // If no user document exists, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching user channels:', error);
      return [];
    }
  }

  // Save user's channel preferences
  async saveUserChannels(userId: string, channels: YouTubeChannel[]): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        channels,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user channels:', error);
      throw error;
    }
  }

  // Toggle channel monitoring
  async toggleChannel(userId: string, channelId: string, enabled: boolean): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const channels = data.channels || [];
        
        const updatedChannels = channels.map((channel: YouTubeChannel) =>
          channel.id === channelId ? { ...channel, enabled } : channel
        );
        
        await this.saveUserChannels(userId, updatedChannels);
      }
    } catch (error) {
      console.error('Error toggling channel:', error);
      throw error;
    }
  }

  // Get user's summaries
  async getUserSummaries(userId: string, limit: number = 20): Promise<UserSummary[]> {
    try {
      const summariesQuery = query(
        collection(db, 'summaries'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(summariesQuery);
      const summaries: UserSummary[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        summaries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserSummary);
      });
      
      // Sort by creation date (newest first)
      return summaries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
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
      const aiSummary = await summarizeVideo({
        transcript: transcript.text,
        videoTitle: video.title,
      });

      // Create summary object
      const summary: Omit<UserSummary, 'id'> = {
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

      // Save to Firestore
      const summaryRef = doc(collection(db, 'summaries'));
      await setDoc(summaryRef, {
        ...summary,
        userId,
        createdAt: new Date(),
      });

      return {
        id: summaryRef.id,
        ...summary,
      };
    } catch (error) {
      console.error('Error generating video summary:', error);
      return null;
    }
  }

  // Get summary by video ID
  async getSummaryByVideoId(userId: string, videoId: string): Promise<UserSummary | null> {
    try {
      const summaryQuery = query(
        collection(db, 'summaries'),
        where('userId', '==', userId),
        where('videoId', '==', videoId)
      );
      
      const querySnapshot = await getDocs(summaryQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserSummary;
      }
      
      return null;
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
    } catch (error) {
      console.error('Error syncing user channels:', error);
      throw error;
    }
  }

  // Delete a summary
  async deleteSummary(userId: string, summaryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'summaries', summaryId));
    } catch (error) {
      console.error('Error deleting summary:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 