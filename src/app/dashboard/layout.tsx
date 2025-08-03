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
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">Summer User</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
            <Button asChild variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <Link href="/" aria-label="Log out">
                    <LogOut className="w-4 h-4" />
                </Link>
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
