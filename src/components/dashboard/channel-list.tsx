"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/nextauth";
import { userService } from "@/lib/user-service";
import { YouTubeChannel } from "@/lib/youtube";

export function ChannelList() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadChannels();
    }
  }, [user]);

  const loadChannels = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userChannels = await userService.getUserChannels(user.email || user.id || '');
      setChannels(userChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    if (!user) return;
    
    try {
      const channel = channels.find(c => c.id === id);
      if (channel) {
        const newEnabled = !channel.enabled;
        await userService.toggleChannel(user.email || user.id || '', id, newEnabled);
        setChannels(prev => 
          prev.map(c => c.id === id ? { ...c, enabled: newEnabled } : c)
        );
      }
    } catch (error) {
      console.error('Error toggling channel:', error);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    
    try {
      setSyncing(true);
      
      // Get the access token from the session
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      console.log('Session data:', session);
      
      if (session?.accessToken) {
        // Sync channels using the access token
        await userService.syncUserChannels(user.id || user.email || '', session.accessToken);
        await loadChannels();
      } else if (session?.user?.accessToken) {
        // Fallback to user.accessToken
        await userService.syncUserChannels(user.id || user.email || '', session.user.accessToken);
        await loadChannels();
      } else {
        console.error('No access token available');
        // Fallback to mock data for testing
        const mockChannels = [
          { id: '1', name: 'Marques Brownlee', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man tech', enabled: true },
          { id: '2', name: 'MrBeast', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man fun', enabled: true },
          { id: '3', name: 'Lex Fridman', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man podcast', enabled: false },
          { id: '4', name: 'Fireship', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'code fire', enabled: true },
          { id: '5', name: 'Veritasium', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'science man', enabled: true },
        ];
        await userService.saveUserChannels(user.id || user.email || '', mockChannels);
        setChannels(mockChannels);
      }
    } catch (error) {
      console.error('Error syncing channels:', error);
      // Fallback to mock data
      const mockChannels = [
        { id: '1', name: 'Marques Brownlee', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man tech', enabled: true },
        { id: '2', name: 'MrBeast', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man fun', enabled: true },
        { id: '3', name: 'Lex Fridman', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man podcast', enabled: false },
        { id: '4', name: 'Fireship', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'code fire', enabled: true },
        { id: '5', name: 'Veritasium', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'science man', enabled: true },
      ];
      await userService.saveUserChannels(user.id || user.email || '', mockChannels);
      setChannels(mockChannels);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading channels...</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sidebar-foreground">Channels</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-8 w-8 p-0"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="space-y-1">
          {channels.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No channels found</p>
              <p className="text-xs text-muted-foreground mt-1">Sync to load your YouTube subscriptions</p>
            </div>
          ) : (
            channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={channel.avatarUrl} alt={channel.name} data-ai-hint={channel.avatarHint} />
                    <AvatarFallback className="text-xs">{channel.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-sidebar-foreground truncate">{channel.name}</span>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={() => handleToggle(channel.id)}
                  aria-label={`Toggle monitoring for ${channel.name}`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
