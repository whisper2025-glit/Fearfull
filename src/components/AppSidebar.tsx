import { useState } from "react";
import {
  Home,
  Plus,
  MessageCircle,
  Search,
  Gift
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, useClerk, SignInButton } from "@clerk/clerk-react";
import { CreateModal } from "@/components/CreateModal";
import { setSupabaseAuth } from "@/lib/supabase";
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

  // Clerk authentication hooks
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async () => {
    try {
      // Clear Supabase session first
      await setSupabaseAuth(null);
      console.log('🔓 Supabase session cleared');
    } catch (error) {
      console.warn('⚠️ Error clearing Supabase session on logout:', error);
    }

    // Then sign out from Clerk
    await signOut();
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-sidebar-border bg-sidebar`}>
      <SidebarContent className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-cyan-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
          </div>
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
                      {user?.username?.charAt(0) || user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">
                        {user?.username || user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName) || "User"}
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
        ) : (
          <SignInButton mode="modal" fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-full h-12"
              size="default"
            >
              {!collapsed ? "Log in / Sign up" : "Login"}
            </Button>
          </SignInButton>
        )}
      </SidebarFooter>

      <CreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </Sidebar>
  );
}
