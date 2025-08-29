import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
  headerBottom?: ReactNode;
  mainOverflow?: 'auto' | 'hidden';
  headerPosition?: 'sticky' | 'fixed';
  hideHeader?: boolean;
  headerBorder?: boolean;
  headerBottomBorder?: boolean;
}

export function Layout({ children, headerBottom, mainOverflow = 'auto', headerPosition = 'sticky', hideHeader = false, headerBorder = true, headerBottomBorder = true }: LayoutProps) {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {!hideHeader && (
            <header className={(headerPosition === 'fixed' ? 'fixed top-0 left-0 right-0 ' : 'sticky top-0 ') + 'z-40 bg-background/95 backdrop-blur-sm ' + (headerBorder ? 'border-b border-border' : '')}>
              <div className="h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-foreground hover:text-primary" />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/search')}
                  >
                    <Search className="h-4 w-4" />
                  </Button>

                  <button
                    onClick={() => navigate('/profile')}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="Open profile"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || 'User'} />
                      <AvatarFallback className="text-xs">
                        {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </div>
              </div>
              {headerBottom ? (
                <div className={"px-4 py-2 " + (headerBottomBorder ? 'border-t border-border' : '')}>
                  {headerBottom}
                </div>
              ) : null}
            </header>
          )}

          {/* Main Content */}
          <main className={mainOverflow === 'hidden' ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto'}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
