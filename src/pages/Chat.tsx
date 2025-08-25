import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MoreHorizontal, Lightbulb, Clock, Users, Bot, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ModelsModal, Model } from "@/components/ModelsModal";
import { openRouterAPI, ChatMessage } from "@/lib/openrouter";
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
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
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

  // Initialize characters state to allow for dynamic character loading
  const [characters, setCharacters] = useState<Record<string, Character>>({
    "1": {
      name: "You Are Like Your Father - Angela",
      author: "@Just a Random Guy",
      intro: "Since your parents divorced, your mom Angela has never treated you the same. Cold, bitter, and always picking fights, like she blames you for everything your father did.",
      scenario: "You are the new student from Shiketsu high! And today is your first day! (Any gender and quirk!)",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
      messages: [
        {
          id: -2,
          content: "Since your parents divorced, your mom Angela has never treated you the same. Cold, bitter, and always picking fights, like she blames you for everything your father did.",
          isBot: true,
          timestamp: "now",
          type: "intro",
          characterName: "You Are Like Your Father - Angela",
          author: "@Just a Random Guy"
        },
        {
          id: -1,
          content: "You are the new student from Shiketsu high! And today is your first day! (Any gender and quirk!)",
          isBot: true,
          timestamp: "now",
          type: "scenario"
        },
        {
          id: 1,
          content: `The class looked at you as you entered

Katsuki: "Hah!? Who the hell is this extra!?" He said annoyed,

Izuku: "Kacchan that's the new exchange student," he whispered

Denki: "are they a girl?...I can't tell"

Jirou: "pretty obvious since your so brain-dead sparky"

Momo: she stood up and cleared her throat, "Everyone please! Let's let them introduce their self" she smiled

Shoto: he looked at you curious

Aizawa: "introduce yourself and take`,
          isBot: true,
          timestamp: "now",
          type: "regular"
        }
      ]
    },
    // Add other characters as needed
  });

  const currentCharacter = characters[characterId as keyof typeof characters] || characters["1"];

  // Load scene background and test OpenRouter connection on mount
  useEffect(() => {
    // Load scene background from localStorage
    const savedBackground = localStorage.getItem('scene-background');
    if (savedBackground) {
      setSceneBackground(savedBackground);
    }

    // Load character data if it's a newly created character
    const savedCharacter = localStorage.getItem('current-character');
    if (savedCharacter) {
      try {
        const characterData = JSON.parse(savedCharacter);
        if (characterData.id === characterId) {
          // This is a newly created character, we could update the characters object here
          // For now, we'll just use the scene background
          console.log('Loaded newly created character:', characterData.name);
        }
      } catch (error) {
        console.error('Error parsing saved character:', error);
      }
    }

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

    testConnection();
  }, [characterId]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

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

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: message,
      isBot: false,
      timestamp: "now",
      type: "regular"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
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

      const botMessage: Message = {
        id: Date.now() + 1,
        content: response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.",
        isBot: true,
        timestamp: "now",
        type: "regular"
      };

      setMessages(prev => [...prev, botMessage]);
      toast.success(`Response received from ${modelToUse.author}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to get response from ${modelToUse.author}. Please check your API key and try again.`);

      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm sorry, I'm having trouble responding right now. Please check your API connection and try again.",
        isBot: true,
        timestamp: "now",
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

  const allMessages = [...currentCharacter.messages, ...messages];

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
          <h1 className="text-sm font-semibold">Angela</h1>
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
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
              <Users className="h-3 w-3" />
              Persona
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
    </div>
  );
};

export default Chat;
