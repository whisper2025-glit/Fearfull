import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Settings,
  Moon,
  ChevronRight,
  LogOut,
  Instagram,
  Mail,
  Twitter,
} from "lucide-react";
import { useUser, useClerk } from "@/lib/fake-clerk";
import { supabase } from "@/lib/supabase";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

// Custom Discord Icon
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Custom Reddit Icon
const RedditIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

interface SettingsSheetProps {
  children: React.ReactNode;
}

const SettingsSheet = ({ children }: SettingsSheetProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [participateInLeaderboards, setParticipateInLeaderboards] = useState(true);
  const [allowFollowers, setAllowFollowers] = useState(true);
  const { user } = useUser();
  const { signOut } = useClerk();

  const [open, setOpen] = useState(false);
  useHistoryBackClose(open, setOpen, "settings-sheet");

  const [account, setAccount] = useState({
    uid: "",
    email: "",
    plan: "free"
  });

  useEffect(() => {
    const loadAccount = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("users")
          .select("email, plan")
          .eq("id", user.id)
          .single();

        setAccount({
          uid: user.id,
          email: data?.email || user.emailAddresses?.[0]?.emailAddress || "",
          plan: (data as any)?.plan || "free",
        });
      } catch (e) {
        setAccount({
          uid: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || "",
          plan: "free",
        });
      }
    };
    loadAccount();

  }, [user]);


  const contactLinks = [
    {
      name: "Discord",
      icon: DiscordIcon,
      href: "#",
      color: "text-indigo-400"
    },
    {
      name: "Reddit",
      icon: RedditIcon,
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
      color: "text-cyan-500"
    },
    {
      name: "Email",
      icon: Mail,
      href: "#",
      color: "text-cyan-400"
    }
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const handleRemoveAccount = () => {
    console.log("Removing account...");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm bg-gray-900 text-white border-gray-800 p-0 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-xl font-semibold text-white text-center">
              Settings
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-white" />
                <span className="text-white">Dark mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-cyan-600"
              />
            </div>

            <Separator className="bg-gray-700" />


            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Account</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">UID</span>
                  <span className="text-gray-300">{account.uid}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">Email</span>
                  <span className="text-gray-300 text-sm break-all">{account.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">Current Plan</span>
                  <span className="text-gray-300 capitalize">{account.plan}</span>
                </div>

                <button className="flex items-center justify-between w-full text-left">
                  <span className="text-white">Manage Subscription</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Privacy</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Participate in leaderboards</span>
                  <Switch
                    checked={participateInLeaderboards}
                    onCheckedChange={setParticipateInLeaderboards}
                    className="data-[state=checked]:bg-cyan-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">Allow other users to follow me</span>
                  <Switch
                    checked={allowFollowers}
                    onCheckedChange={setAllowFollowers}
                    className="data-[state=checked]:bg-cyan-600"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium">Contact Us</h3>

              <div className="space-y-2">
                {contactLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <button
                      key={link.name}
                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                      onClick={() => window.open(link.href, '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-5 w-5 ${link.color}`} />
                        <span className="text-white">{link.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
              Use of Whisperchat.AI is bound by our{" "}
              <button className="text-cyan-400 underline hover:text-cyan-300">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-cyan-400 underline hover:text-cyan-300">
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
