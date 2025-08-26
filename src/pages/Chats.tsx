import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MessageCircle, Search, Plus, Archive, Trash2, Clock, MoreHorizontal, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  title: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
  character: {
    name: string;
    avatar_url: string | null;
    owner: {
      full_name: string;
    };
  };
  last_message?: {
    content: string;
    is_bot: boolean;
    created_at: string;
  };
}

const Chats = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        // Query conversations with character info and last message
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            character:characters(
              name,
              avatar_url,
              owner:users!characters_owner_id_fkey(full_name)
            ),
            last_message:messages(
              content,
              is_bot,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('is_archived', activeTab === 'archived')
          .order('last_message_at', { ascending: false });

        if (error) {
          console.error('Error loading conversations:', error);
          toast.error('Failed to load conversations');
          return;
        }

        // Process the data to get the actual last message
        const processedConversations = await Promise.all(
          (data || []).map(async (conv) => {
            // Get the actual last message for this conversation
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, is_bot, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...conv,
              last_message: lastMessage
            };
          })
        );

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user, activeTab]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Archive/Unarchive conversation
  const toggleArchive = async (conversationId: string, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: !isArchived })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );

      toast.success(isArchived ? 'Conversation restored' : 'Conversation archived');
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error('Failed to update conversation');
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Navigate to character selection to start new chat
  const startNewChat = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Please sign in to view your conversations.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Your Conversations
            </h1>
            <Button onClick={startNewChat} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Chats</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <ConversationList
              conversations={filteredConversations}
              isLoading={isLoading}
              onNavigate={(convId, charId) => navigate(`/chat/${charId}?conversation=${convId}`)}
              onArchive={toggleArchive}
              onDelete={deleteConversation}
              isArchived={false}
            />
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <ConversationList
              conversations={filteredConversations}
              isLoading={isLoading}
              onNavigate={(convId, charId) => navigate(`/chat/${charId}?conversation=${convId}`)}
              onArchive={toggleArchive}
              onDelete={deleteConversation}
              isArchived={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onNavigate: (conversationId: string, characterId: string) => void;
  onArchive: (conversationId: string, isArchived: boolean) => void;
  onDelete: (conversationId: string) => void;
  isArchived: boolean;
}

const ConversationList = ({ 
  conversations, 
  isLoading, 
  onNavigate, 
  onArchive, 
  onDelete, 
  isArchived 
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isArchived ? 'No archived conversations' : 'No conversations yet'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {isArchived 
            ? 'Archived conversations will appear here'
            : 'Start chatting with characters to see your conversations here'
          }
        </p>
        {!isArchived && (
          <Button onClick={() => window.location.href = '/'}>
            <Users className="h-4 w-4 mr-2" />
            Browse Characters
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id} 
          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
          onClick={() => onNavigate(conversation.id, conversation.character_id)}
        >
          <div className="flex items-center gap-3">
            {/* Character Avatar */}
            <img
              src={conversation.character.avatar_url || "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"}
              alt={conversation.character.name}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {conversation.title || `Chat with ${conversation.character.name}`}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {conversation.message_count} messages
                </Badge>
                {isArchived && (
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                by {conversation.character.owner.full_name}
              </p>

              {conversation.last_message && (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message.is_bot ? conversation.character.name : 'You'}: {conversation.last_message.content}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onArchive(conversation.id, conversation.is_archived);
                  }}>
                    <Archive className="h-4 w-4 mr-2" />
                    {isArchived ? 'Restore' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
                        onDelete(conversation.id);
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Chats;
