import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MessageCircle, Clock, User } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CharacterHistory {
  id: string;
  name: string;
  avatar_url: string;
  author: string;
  lastChatDate: string;
  totalMessages: number;
  lastMessage: string;
  isVip?: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

const Chats = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recent");
  const [characterHistory, setCharacterHistory] = useState<CharacterHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCharacterHistory = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Get characters the user has chatted with by querying messages
        const { data: messageData, error } = await supabase
          .from('messages')
          .select(`
            character_id,
            content,
            created_at,
            characters!inner(
              id,
              name,
              avatar_url,
              users!characters_owner_id_fkey(full_name)
            )
          `)
          .eq('author_id', user.id)
          .eq('is_bot', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading character history:', error);
          toast.error('Failed to load chat history');
          return;
        }

        if (!messageData || messageData.length === 0) {
          setCharacterHistory([]);
          return;
        }

        // Group messages by character and create history objects
        const characterMap = new Map<string, CharacterHistory>();

        messageData.forEach((message: any) => {
          const characterId = message.character_id;
          const character = message.characters;
          
          if (!character) return;

          if (!characterMap.has(characterId)) {
            characterMap.set(characterId, {
              id: characterId,
              name: character.name,
              avatar_url: character.avatar_url || "/placeholder.svg",
              author: character.users?.full_name || "Unknown",
              lastChatDate: message.created_at,
              totalMessages: 1,
              lastMessage: message.content,
            });
          } else {
            const existing = characterMap.get(characterId)!;
            existing.totalMessages += 1;
            // Keep the most recent message date and content
            if (new Date(message.created_at) > new Date(existing.lastChatDate)) {
              existing.lastChatDate = message.created_at;
              existing.lastMessage = message.content;
            }
          }
        });

        // Convert map to array and sort by last chat date
        const historyArray = Array.from(characterMap.values()).sort(
          (a, b) => new Date(b.lastChatDate).getTime() - new Date(a.lastChatDate).getTime()
        );

        setCharacterHistory(historyArray);
      } catch (error) {
        console.error('Error loading character history:', error);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacterHistory();
  }, [user]);

  const startNewChat = (characterId: string) => {
    navigate(`/chat/${characterId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Please sign in to view your chat history.</p>
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
              value="recent"
              className="bg-transparent text-white border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none py-3"
            >
              <span className="text-sm">Recent Chats</span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="bg-transparent text-white border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none py-3 relative"
            >
              <span className="text-sm">Favorites</span>
              <Badge className="ml-2 bg-yellow-500 text-black px-2 py-0.5 text-xs font-bold">
                SOON
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
      mainOverflow="auto"
      headerPosition="fixed"
    >
      <div className="bg-gray-900 text-white min-h-full">
        <Tabs value={activeTab} className="w-full">
          {/* Recent Chats */}
          <TabsContent value="recent" className="mt-0">
            <div className="p-4 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : characterHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No chat history yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start chatting with characters to see them here
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Explore Characters
                  </button>
                </div>
              ) : (
                characterHistory.map((character) => (
                  <Card
                    key={character.id}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => startNewChat(character.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Character Avatar */}
                        <Avatar className="w-14 h-14 flex-shrink-0">
                          <AvatarImage src={character.avatar_url} alt={character.name} />
                          <AvatarFallback className="bg-gray-600 text-white text-lg">
                            {character.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Character Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate text-base">
                              {character.name}
                            </h3>
                            {character.isVip && (
                              <Badge className="bg-yellow-500 text-black text-xs px-2 py-0.5">
                                VIP
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <User className="h-3 w-3" />
                            <span>by {character.author}</span>
                          </div>
                          
                          <p className="text-gray-300 text-sm truncate mb-2">
                            "{character.lastMessage}"
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{character.totalMessages} messages</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(character.lastChatDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites" className="mt-0">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Favorites Coming Soon</h3>
              <p className="text-gray-500 mb-4">
                Soon you'll be able to mark your favorite characters for quick access
              </p>
              <Badge className="bg-yellow-500 text-black px-4 py-2">
                Feature in Development
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Chats;
