"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { channels as initialChannels, type Channel } from "@/lib/data";

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);

  const handleToggle = (id: string) => {
    setChannels((prevChannels) =>
      prevChannels.map((channel) =>
        channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
      )
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {channels.map((channel) => (
          <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Avatar>
                <AvatarImage src={channel.avatarUrl} alt={channel.name} data-ai-hint={channel.avatarHint} />
                <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-sidebar-foreground truncate">{channel.name}</span>
            </div>
            <Switch
              checked={channel.enabled}
              onCheckedChange={() => handleToggle(channel.id)}
              aria-label={`Toggle monitoring for ${channel.name}`}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
