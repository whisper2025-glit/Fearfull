import { useState } from "react";
import {
  Home,
  Plus,
  MessageCircle,
  Search,
  BookOpen,
  Wrench,
  Bot,
  Settings,
  Crown
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  { title: "Create a bot", url: "/create", icon: Plus },
  { title: "Home", url: "/", icon: Home },
  { title: "Novel", url: "/novel", icon: BookOpen, badge: "beta" },
  { title: "Chats", url: "/chats", icon: MessageCircle },
  { title: "Search", url: "/search", icon: Search },
  { title: "Joybook", url: "/joybook", icon: BookOpen },
  { title: "Toolkit", url: "/toolkit", icon: Wrench },
  { title: "My Bots", url: "/my-bots", icon: Bot },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Authentication state - for demo purposes, we'll use a state variable
  // In a real app, this would come from a global auth context
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isActive = (path: string) => currentPath === path;

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Handle logout
      setIsAuthenticated(false);
    } else {
      // Handle login/signup - for demo, just toggle the state
      setIsAuthenticated(true);
    }
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-sidebar-border bg-sidebar`}>
      <SidebarContent className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-white">
              Joyland
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
                    onClick={() => navigate(item.url)}
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

        {/* Subscribe Button */}
        <div className="mt-auto">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium"
            size={collapsed ? "icon" : "default"}
          >
            <Crown className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Subscribe -50%</span>}
          </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 w-full justify-start h-auto"
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png" />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">L</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Leon</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="bg-background border-border mb-2">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Task
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              User guide
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Join Discord
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarContent>
    </Sidebar>
  );
}
