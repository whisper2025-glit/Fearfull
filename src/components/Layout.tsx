import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface LayoutProps {
  children: ReactNode;
  headerBottom?: ReactNode;
  mainOverflow?: 'auto' | 'hidden';
  headerPosition?: 'sticky' | 'fixed';
  hideHeader?: boolean;
  headerBorder?: boolean;
  headerBottomBorder?: boolean;
  hideTopBar?: boolean;
}

export function Layout({ children, headerBottom, mainOverflow = 'auto', headerPosition = 'sticky', hideHeader = false, headerBorder = true, headerBottomBorder = true, hideTopBar = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // Measure header height for fixed positioning so main can offset correctly
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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
  }, [headerBottom, hideTopBar]);

  const headerClass = useMemo(() => {
    const base = 'z-40 bg-background/95 backdrop-blur-sm ' + (headerBorder ? 'border-b border-border' : '');
    return (headerPosition === 'fixed' ? 'fixed top-0 left-0 right-0 ' : 'sticky top-0 ') + base;
  }, [headerBorder, headerPosition]);

  // When header is fixed, ensure content scrolls under it
  const mainBaseClass = mainOverflow === 'hidden' ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1 min-h-0 overflow-auto';
  const mainClassName = mainBaseClass;
  const mainStyle = hideHeader ? undefined : (headerPosition === 'fixed' ? { paddingTop: headerHeight } : undefined);

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
