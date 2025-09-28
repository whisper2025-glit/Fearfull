import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
  headerBottom?: ReactNode;
  mainOverflow?: 'auto' | 'hidden';
  headerPosition?: 'sticky' | 'fixed';
  hideHeader?: boolean;
  headerBorder?: boolean;
  headerBottomBorder?: boolean;
  hideTopBar?: boolean;
  contentUnderHeader?: boolean;
  hideSearchIcon?: boolean;
  hideUserAvatar?: boolean;
}

export function Layout({ children, headerBottom, mainOverflow = 'auto', headerPosition = 'sticky', hideHeader = false, headerBorder = true, headerBottomBorder = true, hideTopBar = false, contentUnderHeader = false, hideSearchIcon = false, hideUserAvatar = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // Measure header height for fixed positioning so main can offset correctly
  const headerRef = useRef<HTMLElement | null>(null);
  const DEFAULT_TOPBAR_H = 56; // h-14
  const [headerHeight, setHeaderHeight] = useState<number>(() => {
    if (hideHeader) return 0;
    const topBarH = hideTopBar ? 0 : DEFAULT_TOPBAR_H;
    const bottomApprox = headerBottom ? 40 : 0; // approximate until measured
    return topBarH + bottomApprox;
  });

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [headerBottom, hideTopBar, hideHeader]);

  const headerClass = useMemo(() => {
    const base = 'z-40 bg-background/95 backdrop-blur-sm ' + (headerBorder ? 'border-b border-border' : '');
    return (headerPosition === 'fixed' ? 'fixed top-0 left-0 right-0 ' : 'sticky top-0 ') + base;
  }, [headerBorder, headerPosition]);

  // When header is fixed, optionally allow content to slide underneath by not offsetting main
  const mainBaseClass = mainOverflow === 'hidden' ? 'flex-1 min-h-0 h-full overflow-hidden' : 'flex-1 min-h-0 h-full overflow-y-auto overscroll-y-contain touch-pan-y';
  const mainClassName = mainBaseClass + '';
  const mainStyle: CSSProperties = {
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    ...(hideHeader
      ? {}
      : headerPosition === 'fixed' && !contentUnderHeader
        ? { paddingTop: headerHeight }
        : {})
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {!hideHeader && (
            <header ref={headerRef} className={headerClass}>
              {!hideTopBar && (
                <div className="h-14 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-foreground hover:text-primary" />
                  </div>

                  <div className="flex items-center gap-3">
                    {!hideSearchIcon && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => navigate('/search')}
                        aria-label="Search"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    )}

                    {user && !hideUserAvatar && (
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
                    )}

                    {!user && (
                      <Button
                        onClick={() => {
                          try {
                            sessionStorage.setItem('authReturnTo', location.pathname + (location.search || ''));
                          } catch {}
                          navigate('/auth');
                        }}
                        className="h-8 px-4 rounded-full"
                        size="sm"
                      >
                        Sign in
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {headerBottom ? (
                <div className={"px-4 py-2 " + (headerBottomBorder ? (hideTopBar ? '' : 'border-t ') + 'border-border' : '')}>
                  {headerBottom}
                </div>
              ) : null}
            </header>
          )}

          <main className={mainClassName} style={mainStyle}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
