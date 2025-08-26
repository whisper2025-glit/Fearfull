import { useState, useEffect, useRef, useCallback } from "react";
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

const makeChat = (i: number): ChatItem => ({
  id: `test-${i}`,
  characterName: `User ${i}`,
  characterAvatar: `https://i.pravatar.cc/150?img=${10 + (i % 70)}`,
  messagePreview: `*Sample message snippet number ${i}...`,
  timestamp: i % 2 === 0 ? 'Yesterday' : '4:09 am'
});

const Chats = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("individual");
  const [items, setItems] = useState<ChatItem[]>(Array.from({ length: 20 }, (_, idx) => makeChat(idx + 1)));
  const loadingRef = useRef(false);
  const nextIndexRef = useRef(items.length + 1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const batchSize = 20;
    const start = nextIndexRef.current;
    const newItems = Array.from({ length: batchSize }, (_, k) => makeChat(start + k));
    nextIndexRef.current += batchSize;
    setItems(prev => [...prev, ...newItems]);
    setTimeout(() => { loadingRef.current = false; }, 150);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        loadMore();
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

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
    <Layout
      headerBottom={
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
      }
      mainOverflow="auto"
      headerPosition="fixed"
    >
      <div className="bg-gray-900 text-white">
        <Tabs value={activeTab} className="w-full">
          {/* Individual Chats */}
          <TabsContent value="individual" className="mt-0">
            <div className="divide-y divide-gray-700">
              {chats.map((chat) => (
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
    </Layout>
  );
};

export default Chats;
