import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  headerBottom?: ReactNode;
  mainOverflow?: 'auto' | 'hidden';
  headerPosition?: 'sticky' | 'fixed';
}

export function Layout({ children, headerBottom, mainOverflow = 'auto', headerPosition = 'sticky' }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className={(headerPosition === 'fixed' ? 'fixed top-0 left-0 right-0 ' : 'sticky top-0 ') + 'z-40 bg-background/95 backdrop-blur-sm border-b border-border'}>
            <div className="h-14 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground hover:text-primary" />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/search')}
                >
                  <Search className="h-4 w-4" />
                </Button>

                <Button variant="outline" className="gradient-text border-primary/20 hover:border-primary/40 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  50% off!
                </Button>
              </div>
            </div>
            {headerBottom ? (
              <div className="h-12 flex items-center px-4 border-t border-border">
                {headerBottom}
              </div>
            ) : null}
          </header>

          {/* Main Content */}
          <main className={mainOverflow === 'hidden' ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto'}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
