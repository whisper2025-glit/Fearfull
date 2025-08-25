import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Moon,
  ChevronRight,
  LogOut,
  Instagram,
  Mail,
  Twitter
} from "lucide-react";

interface SettingsSheetProps {
  children: React.ReactNode;
}

const SettingsSheet = ({ children }: SettingsSheetProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [participateInLeaderboards, setParticipateInLeaderboards] = useState(true);
  const [allowFollowers, setAllowFollowers] = useState(true);

  const userAccount = {
    uid: "3x2ZPZ",
    email: "matiureleeroy200804@gmail.com",
    plan: "free"
  };

  const contactLinks = [
    {
      name: "Discord",
      icon: MessageCircle,
      href: "#",
      color: "text-indigo-400"
    },
    {
      name: "Reddit",
      icon: MessageCircle,
      href: "#",
      color: "text-orange-500"
    },
    {
      name: "X",
      icon: Twitter,
      href: "#",
      color: "text-white"
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      color: "text-pink-500"
    },
    {
      name: "Email",
      icon: Mail,
      href: "#",
      color: "text-blue-400"
    }
  ];

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...");
  };

  const handleRemoveAccount = () => {
    // Handle account removal logic
    console.log("Removing account...");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-sm bg-gray-900 text-white border-gray-800 p-0 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-xl font-semibold text-white text-center">
              Settings
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-white" />
                <span className="text-white">Dark mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <Separator className="bg-gray-700" />

            {/* Account Section */}
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Account</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">UID</span>
                  <span className="text-gray-300">{userAccount.uid}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Email</span>
                  <span className="text-gray-300 text-sm">{userAccount.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Current Plan</span>
                  <span className="text-gray-300">{userAccount.plan}</span>
                </div>
                
                <button className="flex items-center justify-between w-full text-left">
                  <span className="text-white">Manage Subscription</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Privacy Section */}
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Privacy</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Participate in leaderboards</span>
                  <Switch
                    checked={participateInLeaderboards}
                    onCheckedChange={setParticipateInLeaderboards}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Allow other users to follow me</span>
                  <Switch
                    checked={allowFollowers}
                    onCheckedChange={setAllowFollowers}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Contact Us Section */}
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Contact Us</h3>
              
              <div className="space-y-2">
                {contactLinks.map((link) => (
                  <button
                    key={link.name}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                    onClick={() => window.open(link.href, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                      <span className="text-white">{link.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 space-y-4 border-t border-gray-700">
            <Button
              onClick={handleLogout}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
            
            <button
              onClick={handleRemoveAccount}
              className="text-white underline text-sm hover:text-gray-300 transition-colors"
            >
              Remove account
            </button>
            
            <div className="text-center text-xs text-gray-400">
              Use of Joyland.AI is bound by our{" "}
              <button className="text-blue-400 underline hover:text-blue-300">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-blue-400 underline hover:text-blue-300">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
