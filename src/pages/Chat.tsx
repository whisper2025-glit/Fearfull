import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Home, MoreHorizontal, Lightbulb, Clock, Users, Bot, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ModelsModal, Model } from "@/components/ModelsModal";
import { PersonaModal } from "@/components/PersonaModal";
import { openRouterAPI, ChatMessage } from "@/lib/openrouter";
import { supabase, createOrUpdateUser, getDefaultPersona } from "@/lib/supabase";
import { toast } from "sonner";

interface Message {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: string;
  type?: 'intro' | 'scenario' | 'regular';
  characterName?: string;
  author?: string;
}

interface Character {
  name: string;
  author: string;
  intro: string;
  scenario: string;
  avatar: string;
  messages: Message[];
}

const Chat = () => {
  const { characterId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get('conversation');
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<any>(null);
  const [sceneBackground, setSceneBackground] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<Model | null>({
    id: "mistral-main",
    name: "mistralai/mistral-small-3.2-24b-instruct:free",
    author: "Mistral AI",
    description: "Excellent for creative roleplay scenarios",
    price: 0,
    responseTime: "850 ms",
    memory: "24B",
    rating: 8.5,
    tags: ["Main", "Roleplay", "Creative", "Free"],
    isActive: true,
    isPremium: false,
    isMain: true,
    provider: 'mistral',
    tier: 'standard'
  });
  const [isLoading, setIsLoading] = useState(false);

  // State for current character and messages loaded from Supabase
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);

  const { user } = useUser();

  // Load character and messages from Supabase
  useEffect(() => {
    const loadCharacterAndMessages = async () => {
      if (!characterId) return;

      setIsLoadingCharacter(true);

      try {
        // Load character data from Supabase
        const { data: characterData, error: characterError } = await supabase
          .from('characters')
          .select('*, users!characters_owner_id_fkey(full_name)')
          .eq('id', characterId)
          .single();

        if (characterError) {
          console.error('Error loading character:', characterError);
          toast.error('Character not found');
          navigate('/');
          return;
        }

        // Load messages for this character/conversation
        let messagesQuery = supabase
          .from('messages')
          .select('*')
          .eq('character_id', characterId);

        // If conversation ID is provided, filter by conversation
        if (conversationId) {
          messagesQuery = messagesQuery.eq('conversation_id', conversationId);
        } else {
          // If no conversation ID, get the most recent conversation for this character and user
          const { data: recentConv } = await supabase
            .from('conversations')
            .select('id, persona_id')
            .eq('character_id', characterId)
            .eq('user_id', user?.id || '')
            .eq('is_archived', false)
            .order('last_message_at', { ascending: false })
            .limit(1)
            .single();

          if (recentConv) {
            setCurrentConversationId(recentConv.id);
            messagesQuery = messagesQuery.eq('conversation_id', recentConv.id);

            // Load the persona associated with this conversation
            if (recentConv.persona_id && !currentPersona) {
              try {
                const { data: conversationPersona } = await supabase
                  .from('personas')
                  .select('*')
                  .eq('id', recentConv.persona_id)
                  .single();

                if (conversationPersona) {
                  setCurrentPersona(conversationPersona);
                  console.log('✅ Conversation persona loaded:', conversationPersona.name);
                }
              } catch (error) {
                console.error('Error loading conversation persona:', error);
              }
            }
          } else {
            // No existing conversation, we'll create one when first message is sent
            messagesQuery = messagesQuery.eq('conversation_id', 'none'); // This will return no messages
          }
        }

        const { data: messagesData, error: messagesError } = await messagesQuery.order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          toast.error('Failed to load messages');
        }

        // Convert Supabase data to local format
        const character: Character = {
          name: characterData.name,
          author: characterData.users?.full_name || 'Unknown',
          intro: characterData.intro,
          scenario: characterData.scenario || "",
          avatar: characterData.avatar_url || "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
          messages: [
            // Always include intro message
            {
              id: -2,
              content: characterData.intro,
              isBot: true,
              timestamp: "now",
              type: "intro",
              characterName: characterData.name,
              author: characterData.users?.full_name || 'Unknown'
            },
            // Include scenario message if it exists
            ...(characterData.scenario ? [{
              id: -1,
              content: characterData.scenario,
              isBot: true,
              timestamp: "now",
              type: "scenario" as const
            }] : []),
            // Include greeting as first regular message if it exists
            ...(characterData.greeting ? [{
              id: 0,
              content: characterData.greeting,
              isBot: true,
              timestamp: "now",
              type: "regular" as const
            }] : []),
            // Add saved messages from database
            ...(messagesData || []).map((msg, index) => ({
              id: index + 1,
              content: msg.content,
              isBot: msg.is_bot,
              timestamp: new Date(msg.created_at).toLocaleTimeString(),
              type: msg.type as 'intro' | 'scenario' | 'regular'
            }))
          ]
        };

        setCurrentCharacter(character);

        // Set scene background if available
        if (characterData.scene_url) {
          setSceneBackground(characterData.scene_url);
        }

      } catch (error) {
        console.error('Error loading character data:', error);
        toast.error('Failed to load character');
        navigate('/');
      } finally {
        setIsLoadingCharacter(false);
      }
    };

    const testConnection = async () => {
      try {
        const isConnected = await openRouterAPI.testConnection();
        if (isConnected) {
          toast.success('OpenRouter API connected successfully!');
        } else {
          toast.error('Failed to connect to OpenRouter API. Please check your configuration.');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        toast.error('OpenRouter API connection test failed.');
      }
    };

    loadCharacterAndMessages();
    testConnection();
  }, [characterId, conversationId, navigate, user]);

  // Load default persona when user is available
  useEffect(() => {
    const loadDefaultPersona = async () => {
      if (!user || currentPersona) return;

      try {
        const defaultPersona = await getDefaultPersona(user.id);
        if (defaultPersona) {
          setCurrentPersona(defaultPersona);
          console.log('✅ Default persona loaded:', defaultPersona.name);
        }
      } catch (error) {
        console.error('Error loading default persona:', error);
        // Don't show error toast for this as it's not critical
      }
    };

    loadDefaultPersona();
  }, [user, currentPersona]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !currentCharacter || !user) return;

    // Use default model if none selected
    const modelToUse = selectedModel || {
      id: "mistral-main",
      name: "mistralai/mistral-small-3.2-24b-instruct:free",
      author: "Mistral AI",
      description: "Default roleplay model",
      price: 0,
      responseTime: "850 ms",
      memory: "24B",
      rating: 8.5,
      tags: ["Main", "Roleplay", "Free"],
      isActive: true,
      isPremium: false,
      isMain: true,
      provider: 'mistral',
      tier: 'standard' as const
    };

    // Add user message to local state immediately for UI responsiveness
    const userMessage: Message = {
      id: Date.now(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
      type: "regular"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      // Ensure user record exists in Supabase (avoids FK/RLS issues)
      try {
        await createOrUpdateUser(user);
      } catch (err) {
        console.error('Error ensuring user exists before conversation:', err);
        toast.error('Account sync failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Determine conversation to use; if none, we'll let DB trigger create it on first message insert
      let conversationToUse = currentConversationId;

      // Save user message to Supabase (omit conversation_id to trigger auto-creation if needed)
      const userMessagePayload: any = {
        character_id: characterId,
        author_id: user.id,
        content: currentMessage,
        is_bot: false,
        type: 'regular'
      };
      if (conversationToUse) {
        userMessagePayload.conversation_id = conversationToUse;
      }
      const { data: insertedUserMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert(userMessagePayload)
        .select('id, conversation_id, created_at')
        .single();

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
      } else if (!conversationToUse && insertedUserMessage?.conversation_id) {
        conversationToUse = insertedUserMessage.conversation_id;
        setCurrentConversationId(conversationToUse);
        // Update URL to include conversation ID
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('conversation', conversationToUse);
        navigate(`/chat/${characterId}?${newSearchParams.toString()}`, { replace: true });
      }

      // Prepare chat messages for OpenRouter
      const allMessages = [...currentCharacter.messages, ...messages, userMessage];
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: openRouterAPI.getRoleplaySystemPrompt(modelToUse, currentCharacter.name)
        },
        // Add character intro and scenario as context
        {
          role: 'system',
          content: `Character: ${currentCharacter.name}\nIntro: ${currentCharacter.intro}\nScenario: ${currentCharacter.scenario}`
        },
        // Add persona information if available
        ...(currentPersona ? [{
          role: 'system' as const,
          content: `User Persona: ${currentPersona.name} (${currentPersona.gender})\nDescription: ${currentPersona.description || 'No additional description'}\n\nThe user is roleplaying as this persona. Please interact with them accordingly and acknowledge their persona in your responses.`
        }] : []),
        // Convert recent messages to chat format (last 10 messages for context)
        ...allMessages.slice(-10).filter(msg => msg.type === 'regular').map(msg => ({
          role: msg.isBot ? 'assistant' as const : 'user' as const,
          content: msg.content
        }))
      ];

      // Get response from OpenRouter
      const response = await openRouterAPI.createChatCompletion(modelToUse, chatMessages, {
        temperature: 0.8,
        max_tokens: 1000
      });

      const botResponseContent = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

      const botMessage: Message = {
        id: Date.now() + 1,
        content: botResponseContent,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        type: "regular"
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message to Supabase
      const { error: botMessageError } = await supabase
        .from('messages')
        .insert({
          character_id: characterId,
          conversation_id: conversationToUse,
          author_id: null, // Bot messages have null author_id
          content: botResponseContent,
          is_bot: true,
          type: 'regular'
        });

      if (botMessageError) {
        console.error('Error saving bot message:', botMessageError);
      }

      toast.success(`Response received from ${modelToUse.author}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to get response from ${modelToUse.author}. Please check your API key and try again.`);

      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm sorry, I'm having trouble responding right now. Please check your API connection and try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        type: "regular"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const allMessages = currentCharacter ? [...currentCharacter.messages, ...messages] : [];

  // Show loading state while character is being loaded
  if (isLoadingCharacter || !currentCharacter) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading character...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden relative"
      style={{
        backgroundImage: sceneBackground ? `url(${sceneBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better readability */}
      {sceneBackground && (
        <div className="absolute inset-0 bg-black/20 z-0" />
      )}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-border/30 bg-background/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-sm font-semibold">{currentCharacter.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Chat Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-full mx-auto h-[calc(100vh-4rem)]">
        {/* Messages */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {allMessages.map((msg) => (
            <div key={msg.id} className="mb-4">
              {msg.type === 'intro' ? (
                <div className="relative pt-8">
                  <Card className="relative p-4 pt-8 bg-card/30 backdrop-blur-sm border-accent/30 shadow-md overflow-visible">
                    {/* Character Avatar - positioned to overlap card border */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
                      <img
                        src={currentCharacter.avatar}
                        alt={currentCharacter.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-background/20"
                      />
                    </div>

                    {/* Background overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/30" />

                    <div className="relative z-10 space-y-3">
                      {/* Character Title */}
                      <div className="text-center">
                        <h2 className="text-lg font-bold text-foreground">{msg.characterName}</h2>
                        <p className="text-sm text-primary/80 mt-1">{msg.author}</p>
                      </div>

                      {/* Intro Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <span className="text-accent font-semibold text-sm bg-accent/10 px-3 py-1 rounded-full">Intro</span>
                        </div>
                        <div className={`transition-all duration-300 ${isIntroExpanded ? 'max-h-none' : 'max-h-16 overflow-hidden'}`}>
                          <p className="text-foreground text-sm leading-relaxed text-center">{msg.content}</p>
                        </div>
                      </div>
                    </div>

                    {/* Collapse/Expand Arrow */}
                    <button
                      onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                      className="absolute bottom-2 right-2 p-1 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-foreground/70 transition-transform duration-300 ${isIntroExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </Card>
                </div>
              ) : msg.type === 'scenario' ? (
                <Card className="p-3 bg-card/30 backdrop-blur-sm border-primary/20">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium text-sm">Scenario:</span>
                    <p className="text-muted-foreground italic text-sm">{msg.content}</p>
                  </div>
                </Card>
              ) : (
                <Card className={`p-3 ${msg.isBot ? 'bg-card/20 backdrop-blur-sm' : 'bg-primary/20 ml-8 backdrop-blur-sm'}`}>
                  <div className="flex items-start gap-3">
                    {msg.isBot && (
                      <img
                        src={currentCharacter.avatar}
                        alt={currentCharacter.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-foreground whitespace-pre-wrap chat-text">{msg.content}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pb-2 bg-background/20 backdrop-blur-sm">
          <div className="flex gap-2 mb-3 overflow-x-auto px-4 scrollbar-hide">
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
              <Lightbulb className="h-3 w-3" />
              Suggest
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
              <Clock className="h-3 w-3" />
              Memory
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0"
              onClick={() => setIsPersonaModalOpen(true)}
            >
              <Users className="h-3 w-3" />
              {currentPersona ? currentPersona.name : 'Persona'}
              {currentPersona && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0"
              onClick={() => setIsModelsModalOpen(true)}
            >
              <Bot className="h-3 w-3" />
              {selectedModel ? selectedModel.author : 'Models'}
              {selectedModel && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </Button>
          </div>
        </div>

        {/* Message Input */}
        <div className="px-4 pb-4 bg-background/20 backdrop-blur-sm border-t border-border/30">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "AI is typing..." : "Type a message"}
              disabled={isLoading}
              className="flex-1 bg-card/50 border-border resize-none min-h-[40px] max-h-[120px] text-sm chat-text"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-4 self-end"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Sending
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Models Modal */}
      <ModelsModal
        open={isModelsModalOpen}
        onOpenChange={setIsModelsModalOpen}
        onModelSelect={setSelectedModel}
        selectedModel={selectedModel}
      />

      <PersonaModal
        open={isPersonaModalOpen}
        onOpenChange={setIsPersonaModalOpen}
        onPersonaSelect={async (persona) => {
          setCurrentPersona(persona);
          setIsPersonaModalOpen(false);

          // Update the current conversation with the new persona
          if (currentConversationId) {
            try {
              await supabase
                .from('conversations')
                .update({ persona_id: persona.id })
                .eq('id', currentConversationId);

              console.log('✅ Conversation updated with new persona');
            } catch (error) {
              console.error('Error updating conversation persona:', error);
            }
          }
        }}
        currentPersona={currentPersona}
      />
    </div>
  );
};

export default Chat;
