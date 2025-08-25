
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
import { useLocation } from "react-router-dom";
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
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-sidebar-border bg-sidebar`}>
      <SidebarContent className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold gradient-text">
              AI Pals Place
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
                    asChild
                    className={`nav-item ${isActive(item.url) ? 'active' : ''}`}
                  >
                    <a href={item.url}>
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
                    </a>
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
        <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">Leon</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
