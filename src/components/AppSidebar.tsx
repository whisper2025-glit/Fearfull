import { useState, useEffect } from "react";
import {
  Home,
  Plus,
  MessageCircle,
  Search,
  Gift
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@/lib/fake-clerk";
import { CreateModal } from "@/components/CreateModal";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BrandLogo from "@/components/BrandLogo";

const menuItems = [
  { title: "Create a bot", url: "/create", icon: Plus, isCreateModal: true },
  { title: "Home", url: "/", icon: Home },
  { title: "Chats", url: "/chats", icon: MessageCircle },
  { title: "Search", url: "/search", icon: Search },
  { title: "Bonus", url: "/bonus", icon: Gift }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>('');

  // Clerk authentication hooks
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Prefer DB-backed display name to keep user-chosen name stable across providers
  useEffect(() => {
    const loadName = async () => {
      if (!user) {
        setUserDisplayName('');
        return;
      }
      try {
        const { getUserDisplayName } = await import('@/lib/supabase');
        const displayName = await getUserDisplayName(user);
        setUserDisplayName(displayName);
      } catch {
        const fallback = user.fullName || user.firstName || user.username || 'User';
        setUserDisplayName(fallback);
      }
    };
    loadName();
  }, [user]);

  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-sidebar-border bg-sidebar`}>
      <SidebarContent className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <BrandLogo size={56} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold text-white">
              Whisperchat
            </span>
          )}
        </div>

        {/* Menu Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={`nav-item ${isActive(item.url) ? 'active' : ''}`}
                    onClick={() => item.isCreateModal ? setIsCreateModalOpen(true) : navigate(item.url)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4">
        {isSignedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 w-full justify-start h-auto"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-gray-500 text-white text-sm">
                      {(userDisplayName || user?.username || user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">
                        {userDisplayName || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">Free Plan</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="bg-background border-border mb-2">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Join Discord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </SidebarFooter>

      <CreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </Sidebar>
  );
}
