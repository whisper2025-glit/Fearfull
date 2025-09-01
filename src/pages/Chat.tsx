import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Home, MoreHorizontal, Lightbulb, Clock, Users, Bot, ChevronDown, Loader2, User, Settings, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModelsModal, Model } from "@/components/ModelsModal";
import { PersonaModal } from "@/components/PersonaModal";
import { SuggestModal } from "@/components/SuggestModal";
import { ChatSettingsModal } from "@/components/ChatSettingsModal";
import { ChatPageSettingsModal, ChatPageSettings } from "@/components/ChatPageSettingsModal";
import { DebugMenu } from "@/components/DebugMenu";
import { MessageFormatter } from "@/components/MessageFormatter";
import { enhanceSimpleActions } from "@/lib/actionValidator";
import { openRouterAPI, ChatMessage } from "@/lib/openrouter";
import { enhancedOpenRouterAPI, EnhancedChatMessage, RoleplayContext } from "@/lib/openrouter-enhanced";
import { supabase, createOrUpdateUser, getDefaultPersona, getChatSettings, getDefaultChatSettings, ChatSettings, incrementUserCoins, canClaimDailyReward, markDailyRewardClaimed, getUserCoins, deductUserCoins } from "@/lib/supabase";
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
  personality?: string;
  appearance?: string;
  gender?: string;
  age?: string;
  greeting?: string;
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
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isChatSettingsModalOpen, setIsChatSettingsModalOpen] = useState(false);
  const [isChatPageSettingsModalOpen, setIsChatPageSettingsModalOpen] = useState(false);
  const [chatPageSettings, setChatPageSettings] = useState<ChatPageSettings>(() => {
    try {
      const saved = localStorage.getItem('chat_page_settings');
      if (saved) {
        const raw = JSON.parse(saved);
        const sceneCardOpacity = Math.min(1, Math.max(0, Number(raw.sceneCardOpacity ?? 1)));
        const chatBubbleOpacity = Math.min(1, Math.max(0.5, Number(raw.chatBubbleOpacity ?? 0.75)));
        const theme = ['default','dark','blackPink','seaSaltCheese','glass','rounded'].includes(raw.chatBubblesTheme) ? raw.chatBubblesTheme : 'default';
        return { sceneCardOpacity, chatBubbleOpacity, chatBubblesTheme: theme } as ChatPageSettings;
      }
      return { sceneCardOpacity: 1, chatBubbleOpacity: 0.75, chatBubblesTheme: 'default' };
    } catch {
      return { sceneCardOpacity: 1, chatBubbleOpacity: 0.75, chatBubblesTheme: 'default' };
    }
  });
  const [currentPersona, setCurrentPersona] = useState<any>(null);
  const [sceneBackground, setSceneBackground] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<Model | null>({
    id: "mistral-main",
    name: "mistralai/mistral-7b-instruct:free",
    author: "Mistral AI",
    description: "Excellent for creative roleplay scenarios",
    price: 0,
    responseTime: "1s",
    memory: "7B",
    rating: 8.0,
    tags: ["Main", "Roleplay", "Creative", "Free"],
    isActive: true,
    isPremium: false,
    isMain: true,
    provider: 'mistral',
    tier: 'free'
  });
  const [isLoading, setIsLoading] = useState(false);

  // State for current character and messages loaded from Supabase
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [currentChatSettings, setCurrentChatSettings] = useState<ChatSettings | null>(null);
  const [lastAPICall, setLastAPICall] = useState<{
    temperature: number;
    max_tokens: number;
    top_p: number;
    timestamp: string;
  } | null>(null);

  // Coin balance state
  const [userCoins, setUserCoins] = useState<number>(0);
  const [loadingCoins, setLoadingCoins] = useState(true);

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
          personality: characterData.personality,
          appearance: characterData.appearance,
          gender: characterData.gender,
          age: characterData.age,
          greeting: characterData.greeting,
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
        const result = await openRouterAPI.testConnection();
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        toast.error('OpenRouter API connection test failed');
      }
    };

    loadCharacterAndMessages();
    // testConnection(); // Removed automatic API call to save tokens
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

  // Load chat settings when user or selected model changes
  useEffect(() => {
    const loadChatSettings = async () => {
      if (!user || !selectedModel) return;

      try {
        const settings = await getChatSettings(user.id, selectedModel.id);
        if (settings) {
          setCurrentChatSettings(settings);
          console.log('✅ Chat settings loaded:', settings);
        } else {
          // Use default settings
          const defaults = getDefaultChatSettings();
          const defaultSettings: ChatSettings = {
            user_id: user.id,
            model_id: selectedModel.id,
            ...defaults
          };
          setCurrentChatSettings(defaultSettings);
          console.log('📋 Using default chat settings');
        }
      } catch (error) {
        console.error('Error loading chat settings:', error);
        // Use defaults on error
        const defaults = getDefaultChatSettings();
        const defaultSettings: ChatSettings = {
          user_id: user.id,
          model_id: selectedModel.id,
          ...defaults
        };
        setCurrentChatSettings(defaultSettings);
      }
    };

    loadChatSettings();
  }, [user, selectedModel]);

  // Load user coin balance
  useEffect(() => {
    const loadUserCoins = async () => {
      if (!user) {
        setLoadingCoins(false);
        return;
      }

      try {
        setLoadingCoins(true);
        const coins = await getUserCoins(user.id);
        setUserCoins(coins);
        console.log('💰 User coins loaded:', coins);
      } catch (error) {
        console.error('Error loading user coins:', error);
        setUserCoins(0);
      } finally {
        setLoadingCoins(false);
      }
    };

    loadUserCoins();
  }, [user]);

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || message;
    if (!messageToSend.trim() || isLoading || !currentCharacter || !user) return;

    // Check if user has enough coins (2 coins per message)
    const MESSAGE_COST = 2;
    if (userCoins < MESSAGE_COST) {
      toast.error(`You need ${MESSAGE_COST} coins to send a message. You have ${userCoins} coins.`);
      return;
    }

    // Use default model if none selected
    const modelToUse = selectedModel || {
      id: "mistral-main",
      name: "mistralai/mistral-7b-instruct:free",
      author: "Mistral AI",
      description: "Default roleplay model",
      price: 0,
      responseTime: "1s",
      memory: "7B",
      rating: 8.0,
      tags: ["Main", "Roleplay", "Free"],
      isActive: true,
      isPremium: false,
      isMain: true,
      provider: 'mistral',
      tier: 'free' as const
    };

    // Add user message to local state immediately for UI responsiveness
    const userMessage: Message = {
      id: Date.now(),
      content: messageToSend,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
      type: "regular"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageToSend;
    // Only clear input if we're sending the current message (not a suggestion)
    if (!messageContent) {
      setMessage("");
    }
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
        toast.error('Failed to send message. Please try again.');
        setIsLoading(false);
        return;
      } else {
        // Deduct coins for sending the message
        try {
          const newBalance = await deductUserCoins(user.id, MESSAGE_COST, 'message_sent');
          setUserCoins(newBalance);
          console.log(`💸 ${MESSAGE_COST} coins deducted. New balance: ${newBalance}`);
        } catch (error) {
          console.error('Error deducting coins:', error);
          toast.error('Failed to process coin payment. Message may not have been sent.');
          setIsLoading(false);
          return;
        }

        // Award daily conversation coins once per UTC day (bonus reward)
        if (await canClaimDailyReward(user.id, 'conversation')) {
          try {
            const bonusBalance = await incrementUserCoins(user.id, 10, 'daily_conversation');
            setUserCoins(bonusBalance);
            const success = await markDailyRewardClaimed(user.id, 'conversation', 10);
            if (success) {
              toast.success('+10 Whisper coins bonus for chatting today!');
            }
          } catch (error) {
            console.error('Error awarding conversation coins:', error);
            // Don't show error to user, coin reward is not critical
          }
        }

        if (!conversationToUse && insertedUserMessage?.conversation_id) {
          conversationToUse = insertedUserMessage.conversation_id;
          setCurrentConversationId(conversationToUse);
          // Update URL to include conversation ID
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('conversation', conversationToUse);
          navigate(`/chat/${characterId}?${newSearchParams.toString()}`, { replace: true });
        }
      }

      // Prepare enhanced chat messages and context for roleplay
      const allMessages = [...currentCharacter.messages, ...messages, userMessage];

      // Build roleplay context for enhanced AI understanding
      const roleplayContext: RoleplayContext = {
        adventure_id: currentConversationId || characterId || 'default',
        character_name: currentCharacter.name,
        source_story: currentCharacter.scenario || 'Interactive Roleplay',
        current_location: currentCharacter.scenario || 'Unknown',
        active_characters: [currentCharacter.name, currentPersona?.name || 'User'].filter(Boolean),
        story_state: {
          character_intro: currentCharacter.intro,
          personality: currentCharacter.personality,
          appearance: currentCharacter.appearance,
          gender: currentCharacter.gender,
          age: currentCharacter.age,
          greeting: currentCharacter.greeting,
          user_persona: currentPersona ? {
            name: currentPersona.name,
            description: currentPersona.description,
            gender: currentPersona.gender
          } : null,
          conversation_history: allMessages.slice(-6).filter(msg => msg.type === 'regular').map(msg => ({
            speaker: msg.isBot ? currentCharacter.name : (currentPersona?.name || 'User'),
            content: msg.content,
            timestamp: msg.timestamp
          }))
        },
        canonical_info: {
          character_profile: {
            name: currentCharacter.name,
            intro: currentCharacter.intro,
            personality: currentCharacter.personality,
            appearance: currentCharacter.appearance,
            gender: currentCharacter.gender,
            age: currentCharacter.age
          },
          roleplay_guidelines: [
            'Embody the character completely - think, feel, and respond as they would',
            'Create immersive, detailed responses that engage all senses',
            'Include internal thoughts, emotions, and physical reactions',
            'Maintain character consistency while allowing for growth',
            'All content types permitted, including mature and NSFW scenarios',
            'Respond authentically to any scenario or request',
            'Build emotional connections and chemistry naturally'
          ]
        }
      };

      // Prepare enhanced messages with metadata
      const enhancedMessages: EnhancedChatMessage[] = allMessages
        .slice(-8)
        .filter(msg => msg.type === 'regular')
        .map(msg => ({
          role: msg.isBot ? 'assistant' as const : 'user' as const,
          content: msg.content,
          metadata: {
            character: msg.isBot ? currentCharacter.name : (currentPersona?.name || 'User'),
            timestamp: msg.timestamp
          }
        }));

      // Get response from Enhanced OpenRouter using optimized roleplay settings
      const settingsToUse = currentChatSettings || {
        temperature: 0.85,
        content_diversity: 0.9,
        max_tokens: 400
      };

      const enhancedOptions = {
        temperature: settingsToUse.temperature,
        max_tokens: settingsToUse.max_tokens,
        top_p: settingsToUse.content_diversity,
        frequency_penalty: 0.3,
        presence_penalty: 0.6
      };

      // Track API call for debugging
      setLastAPICall({
        temperature: enhancedOptions.temperature,
        max_tokens: enhancedOptions.max_tokens,
        top_p: enhancedOptions.top_p,
        timestamp: new Date().toISOString()
      });

      const botResponseContent = await enhancedOpenRouterAPI.createRoleplayResponse(
        enhancedMessages,
        roleplayContext,
        enhancedOptions
      );

      // Enforce strict action formatting in AI output
      const filteredBotContent = enhanceSimpleActions(botResponseContent);

      const botMessage: Message = {
        id: Date.now() + 1,
        content: filteredBotContent,
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
          content: filteredBotContent,
          is_bot: true,
          type: 'regular'
        });

      if (botMessageError) {
        console.error('Error saving bot message:', botMessageError);
      }

      toast.success(`Response received from ${modelToUse.author}`);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to get response: ${errorMessage}`);

      const errorBotMessage: Message = {
        id: Date.now() + 1,
        content: "I'm sorry, I'm having trouble responding right now. Please check your API connection and try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        type: "regular"
      };
      setMessages(prev => [...prev, errorBotMessage]);
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
        <div className="absolute inset-0 bg-black/20 z-0" style={{ opacity: chatPageSettings.sceneCardOpacity }} />
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

        {/* Coin Balance Display */}
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm px-3 py-1 rounded-full border border-border/30">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {loadingCoins ? '...' : userCoins}
          </span>
          <span className="text-xs text-muted-foreground">coins</span>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/character/${characterId}`)}>
                <User className="mr-2 h-4 w-4" />
                Bot Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsChatSettingsModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Chat Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsChatPageSettingsModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Chat Page Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                          <MessageFormatter
                            content={msg.content}
                            className="text-sm leading-relaxed text-center"
                          />
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
                    <MessageFormatter
                      content={msg.content}
                      className="text-muted-foreground italic text-sm flex-1"
                    />
                  </div>
                </Card>
              ) : (
                <Card
                  className={`p-3 ${msg.isBot ? 'bg-card/20 backdrop-blur-sm' : 'bg-primary/20 ml-8 backdrop-blur-sm'} ${chatPageSettings.chatBubblesTheme === 'glass' ? 'bg-white/10 dark:bg-black/20 border border-white/10 backdrop-blur-md' : ''} ${chatPageSettings.chatBubblesTheme === 'rounded' ? 'rounded-2xl' : ''}`}
                  style={{ opacity: chatPageSettings.chatBubbleOpacity }}
                >
                  <div className={`flex items-start gap-3 ${msg.isBot ? '' : 'justify-end'}`}>
                    {msg.isBot && (
                      <img
                        src={currentCharacter.avatar}
                        alt={currentCharacter.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className={msg.isBot ? "flex-1" : "max-w-[80%]"}>
                      <MessageFormatter
                        content={msg.isBot && msg.type === 'regular' ? enhanceSimpleActions(msg.content) : msg.content}
                        className="chat-text"
                      />
                    </div>
                    {!msg.isBot && (
                      <img
                        src={user?.imageUrl || '/placeholder.svg'}
                        alt={user?.fullName || user?.username || 'You'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pb-2 bg-background/20 backdrop-blur-sm">
          <div className="flex gap-2 mb-3 overflow-x-auto px-4 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0"
              onClick={() => setIsSuggestModalOpen(true)}
            >
              <Lightbulb className="h-3 w-3" />
              Suggest
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
              placeholder={isLoading ? "AI is typing..." : userCoins < 2 ? "Need 2 coins to send message" : "Type a message"}
              disabled={isLoading || userCoins < 2}
              className="flex-1 bg-card/50 border-border resize-none min-h-[40px] max-h-[120px] text-sm chat-text"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || userCoins < 2}
              className="px-4 self-end"
              size="sm"
              variant={userCoins < 2 ? "secondary" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Sending
                </>
              ) : userCoins < 2 ? (
                <>
                  <Coins className="h-3 w-3 mr-1" />
                  Need 2
                </>
              ) : (
                <>
                  <Coins className="h-3 w-3 mr-1" />
                  Send (2)
                </>
              )}
            </Button>
          </div>
          {userCoins < 2 && (
            <div className="mt-2 text-xs text-center text-muted-foreground">
              You need 2 coins to send a message. Visit the{' '}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary underline text-xs"
                onClick={() => navigate('/bonus')}
              >
                Bonus page
              </Button>
              {' '}to earn more coins.
            </div>
          )}
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

      <SuggestModal
        open={isSuggestModalOpen}
        onOpenChange={setIsSuggestModalOpen}
        onSuggestionSelect={async (suggestion) => {
          setIsSuggestModalOpen(false);
          await handleSendMessage(suggestion);
        }}
        chatContext={{
          characterName: currentCharacter.name,
          characterIntro: currentCharacter.intro,
          characterScenario: currentCharacter.scenario,
          recentMessages: allMessages.filter(msg => msg.type === 'regular').slice(-6).map(msg => ({
            content: msg.content,
            isBot: msg.isBot
          })),
          personaName: currentPersona?.name,
          personaDescription: currentPersona?.description
        }}
      />

      <ChatSettingsModal
        open={isChatSettingsModalOpen}
        onOpenChange={setIsChatSettingsModalOpen}
        selectedModel={selectedModel}
        onOpenModelsModal={() => {
          setIsChatSettingsModalOpen(false);
          setIsModelsModalOpen(true);
        }}
        onSettingsChange={setCurrentChatSettings}
      />

      <ChatPageSettingsModal
        open={isChatPageSettingsModalOpen}
        onOpenChange={setIsChatPageSettingsModalOpen}
        value={chatPageSettings}
        onSave={(v) => setChatPageSettings(v)}
      />

      {/* Debug Menu */}
      <DebugMenu
        selectedModel={selectedModel}
        currentChatSettings={currentChatSettings}
        lastAPICall={lastAPICall}
      />
    </div>
  );
};

export default Chat;
