import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase, createSupabaseClientWithClerkAuth } from "@/lib/supabase";
import { toast } from "sonner";

interface ChatItem {
  id: string; // conversation id
  characterId: string;
  characterName: string;
  characterAvatar: string;
  messagePreview: string;
  timestamp: string;
  isVip?: boolean;
}

const PAGE_SIZE = 20;

const formatTimestamp = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay && now.getDate() === d.getDate()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 2 * oneDay && new Date(now.getTime() - oneDay).getDate() === d.getDate()) {
    return "Yesterday";
  }
  return d.toLocaleDateString();
};

const Chats = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Create authenticated Supabase client
  const getAuthenticatedSupabase = () => {
    return createSupabaseClientWithClerkAuth(async () => {
      return await getToken({ template: 'supabase' });
    });
  };
  const [activeTab, setActiveTab] = useState("individual");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async () => {
    if (!user || loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    try {
      const from = items.length;
      const to = from + PAGE_SIZE - 1;

      const authSupabase = getAuthenticatedSupabase();
      const { data, error } = await authSupabase
        .from("conversations")
        .select(
          `id, character_id, title, started_at, last_message_at, message_count,
           characters(name, avatar_url),
           messages(content, created_at, is_bot)`
        )
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .range(from, to)
        .order("created_at", { foreignTable: "messages", ascending: false })
        .limit(1, { foreignTable: "messages" });

      if (error) {
        console.error("Failed to load conversations:", error);
        toast.error("Failed to load recent chats");
        return;
      }

      const mapped: ChatItem[] = (data || []).map((c: any) => {
        const lastMsg = Array.isArray(c.messages) && c.messages.length > 0 ? c.messages[0] : null;
        return {
          id: c.id,
          characterId: c.character_id,
          characterName: c.characters?.name || "Unknown",
          characterAvatar: c.characters?.avatar_url || "/placeholder.svg",
          messagePreview: lastMsg?.content || "No messages yet",
          timestamp: formatTimestamp(c.last_message_at || c.started_at),
        };
      });

      setItems(prev => [...prev, ...mapped]);
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, [user, items.length, hasMore]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    // initial load
    fetchPage();
  }, [user, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        fetchPage();
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchPage]);

  const removeFromRecents = async (conversationId: string) => {
    try {
      const authSupabase = getAuthenticatedSupabase();
      const { error } = await authSupabase
        .from("conversations")
        .update({ is_archived: true })
        .eq("id", conversationId)
        .eq("user_id", user?.id || "");
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== conversationId));
      toast.success("Removed from recents");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove");
    }
  };

  const navigateToChat = (conversationId: string) => {
    const convo = items.find(i => i.id === conversationId);
    if (!convo) return;
    navigate(`/chat/${convo.characterId}?conversation=${conversationId}`);
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
              {items.map((chat) => (
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
              {items.length === 0 && (
                <div className="p-8 text-center text-gray-400" style={{ fontSize: '12px' }}>
                  No recent chats yet.
                </div>
              )}
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
        <div ref={sentinelRef} className="h-8" />
      </div>
    </Layout>
  );
};

export default Chats;
