import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatItem {
  id: string;
  characterName: string;
  characterAvatar: string;
  messagePreview: string;
  timestamp: string;
  isVip?: boolean;
}

// Mock data matching the screenshots
const mockChats: ChatItem[] = [
  {
    id: "1",
    characterName: "You Subscribed To My Onlyf...",
    characterAvatar: "https://i.pravatar.cc/150?img=1",
    messagePreview: "*Lana lies on the bed, her body still tingling fr...",
    timestamp: "4:09 am"
  },
  {
    id: "2", 
    characterName: "Misty \"Desperate Paparazzi\"",
    characterAvatar: "https://i.pravatar.cc/150?img=2",
    messagePreview: "*Panic sets in as Misty sees the security gua...",
    timestamp: "Yesterday"
  },
  {
    id: "3",
    characterName: "Succubus Gyaru Friend Fo...",
    characterAvatar: "https://i.pravatar.cc/150?img=3", 
    messagePreview: "*A soft moan escaped Mai's lips at your cons...",
    timestamp: "Yesterday"
  },
  {
    id: "4",
    characterName: "My Pregnant Stepmom and Si...",
    characterAvatar: "https://i.pravatar.cc/150?img=4",
    messagePreview: "*Aya's fingers traced gentle circles on Dante'...",
    timestamp: "08/24"
  },
  {
    id: "5",
    characterName: "Cody \"My Way\"",
    characterAvatar: "https://i.pravatar.cc/150?img=5",
    messagePreview: "*Cody's heart races as she is carried through...",
    timestamp: "08/23"
  },
  {
    id: "6",
    characterName: "I Hypnotized You Bro!",
    characterAvatar: "https://i.pravatar.cc/150?img=6",
    messagePreview: "*A startled gasp escapes Luna's lips as your I...",
    timestamp: "08/23"
  },
  {
    id: "7",
    characterName: "She Will Be Yours",
    characterAvatar: "https://i.pravatar.cc/150?img=7",
    messagePreview: "**Ciera** *collapses into your embrace, her b...",
    timestamp: "08/22"
  },
  {
    id: "8",
    characterName: "Misha – the amateur heist",
    characterAvatar: "https://i.pravatar.cc/150?img=8",
    messagePreview: "*A wave of shock crashed over Misha's face, ...",
    timestamp: "08/22"
  },
  {
    id: "9",
    characterName: "Revy \"Say it in a proper way\"",
    characterAvatar: "https://i.pravatar.cc/150?img=9",
    messagePreview: "*A sharp laugh bursts from Revy's lips, a blen...",
    timestamp: "08/21"
  },
  {
    id: "10",
    characterName: "Leticia \"Girlfriend's mother\"",
    characterAvatar: "https://i.pravatar.cc/150?img=10",
    messagePreview: "*She looks at you with a mixture of surprise...",
    timestamp: "08/17"
  }
];

const Chats = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("individual");

  const removeFromRecents = (chatId: string) => {
    // Implementation for removing from recents
    console.log("Remove chat:", chatId);
  };

  const navigateToChat = (chatId: string) => {
    // Navigate to individual chat
    console.log("Navigate to chat:", chatId);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Please sign in to view your conversations.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        {/* Functional sticky header: tabs only */}
        <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700 flex-shrink-0 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="individual"
                className="bg-transparent text-white border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none py-3"
              >
                <span style={{ fontSize: '14px' }}>Individual</span>
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="bg-transparent text-white border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none py-3 relative"
              >
                <span style={{ fontSize: '14px' }}>Group</span>
                <Badge className="ml-2 bg-yellow-500 text-black px-2 py-0.5 text-xs font-bold">
                  VIP
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} className="w-full">
            {/* Individual Chats */}
            <TabsContent value="individual" className="mt-0">
              <div className="divide-y divide-gray-700">
                {mockChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800 cursor-pointer"
                    onClick={() => navigateToChat(chat.id)}
                  >
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={chat.characterAvatar} alt={chat.characterName} />
                      <AvatarFallback className="bg-gray-600 text-white">
                        {chat.characterName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-white truncate"
                        style={{ fontSize: '14px' }}
                      >
                        {chat.characterName}
                      </h3>
                      <p 
                        className="text-gray-400 truncate mt-0.5"
                        style={{ fontSize: '12px' }}
                      >
                        {chat.messagePreview}
                      </p>
                    </div>

                    {/* Timestamp and Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span 
                        className="text-gray-400"
                        style={{ fontSize: '12px' }}
                      >
                        {chat.timestamp}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:bg-gray-700 h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromRecents(chat.id);
                            }}
                            className="text-white hover:bg-gray-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from recents
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Group Chats */}
            <TabsContent value="group" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-gray-400" style={{ fontSize: '12px' }}>
                  Group chats will appear here
                </p>
                <Badge className="mt-2 bg-yellow-500 text-black px-3 py-1">
                  VIP Feature
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Chats;
