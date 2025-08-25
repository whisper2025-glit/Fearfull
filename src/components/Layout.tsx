
import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground hover:text-primary" />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="gradient-text border-primary/20 hover:border-primary/40 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                50% off!
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
