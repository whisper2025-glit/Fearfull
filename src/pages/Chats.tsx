import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MessageCircle, Clock, User } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const [characterHistory, setCharacterHistory] = useState<CharacterHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load character chat history
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

        const historyArray = Array.from(characterMap.values()).sort(
          (a, b) => new Date(b.lastChatDate).getTime() - new Date(a.lastChatDate).getTime()
        );

        setCharacterHistory(historyArray);
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  const startNewChat = (characterId: string) => {
    navigate(`/chat/${characterId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please sign in to view your chat history.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerPosition="fixed" contentUnderHeader hideSearchIcon hideUserAvatar>
      <div className="bg-background text-foreground min-h-full">
        <div className="px-4 pb-4 pt-6 space-y-2">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : characterHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No character chats yet</h3>
              <p className="text-muted-foreground mb-6">
                Start chatting with characters to see them here
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
              >
                Explore Characters
              </button>
            </div>
          ) : (
            characterHistory.map((character) => (
              <Card
                key={character.id}
                className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => startNewChat(character.id)}
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    {/* Character Avatar */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={character.avatar_url} alt={character.name} />
                      <AvatarFallback className="bg-muted text-foreground text-sm">
                        {character.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Character Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate text-sm">
                          {character.name}
                        </h3>
                        {character.isVip && (
                          <Badge className="bg-yellow-500 text-black text-xs px-2 py-0.5">
                            VIP
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <User className="h-3 w-3" />
                        <span>by {character.author}</span>
                      </div>

                      <p className="text-muted-foreground text-xs truncate">
                        "{character.lastMessage}"
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
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
      </div>
    </Layout>
  );
};

export default Chats;
