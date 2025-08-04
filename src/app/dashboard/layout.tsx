'use client';

import { Logo } from "@/components/logo";
import { ChannelList } from "@/components/dashboard/channel-list";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/nextauth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <Logo href="/dashboard" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ChannelList />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-3 border-t">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} data-ai-hint="person" />
              <AvatarFallback>{user.name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-card sm:p-6 sticky top-0 z-20">
          <h2 className="text-2xl font-bold">Latest Summaries</h2>
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
