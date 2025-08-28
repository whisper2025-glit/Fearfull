import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Send, Heart } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  supabase,
  createOrUpdateUser,
  createAdventureConversation,
  addAdventureMessage,
  getAdventureMessages,
  getUserAdventureConversations
} from "@/lib/supabase";
import { enhancedOpenRouterAPI } from "@/lib/openrouter-enhanced";
import { openRouterAPI } from "@/lib/openrouter";
import { toast } from "sonner";
import { AdventureSettingsModal } from "@/components/AdventureSettingsModal";

interface Adventure {
  id: string;
  owner_id: string;
  name: string;
  plot: string;
  introduction: string;
  adventure_image_url?: string;
  background_image_url?: string;
  adventure_type: 'mcp' | 'custom';
  source_story?: string;
  mcp_settings?: string;
  custom_settings?: string;
  ai_instructions?: string;
  story_summary?: string;
  plot_essentials?: string;
  story_cards?: any[];
  category?: string;
  rating: 'all-ages' | 'teens' | 'adults';
  persona?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

interface StoryMessage {
  id: string;
  content: string;
  isUser: boolean;
  choices?: string[];
  timestamp: string;
}

interface AdventureSettings {
  fontSize: number;
  theme: 'dark' | 'light';
  storyMode: 'interactive' | 'reading';
  lengthMode: 'standard' | 'extended';
}

const AdventurePlay = () => {
  const { adventureId } = useParams<{ adventureId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [messages, setMessages] = useState<StoryMessage[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdventure, setIsLoadingAdventure] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AdventureSettings>({
    fontSize: 14,
    theme: 'dark',
    storyMode: 'interactive',
    lengthMode: 'standard'
  });

  // Load adventure data
  useEffect(() => {
    const loadAdventure = async () => {
      if (!adventureId) return;

      try {
        setIsLoadingAdventure(true);
        
        const { data: adventureData, error } = await supabase
          .from('adventures')
          .select('*')
          .eq('id', adventureId)
          .single();

        if (error) {
          console.error('Error loading adventure:', error);
          toast.error('Failed to load adventure');
          navigate('/');
          return;
        }

        setAdventure(adventureData);

        // Check for existing conversation for this user and adventure
        if (user) {
          const existingConversations = await getUserAdventureConversations(user.id);
          const existingConv = existingConversations.find(conv => conv.adventure_id === adventureId);

          if (existingConv) {
            // Load existing conversation
            setConversationId(existingConv.id);
            const savedMessages = await getAdventureMessages(existingConv.id);

            if (savedMessages && savedMessages.length > 0) {
              const convertedMessages: StoryMessage[] = savedMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                isUser: !msg.is_bot,
                choices: msg.choices || undefined,
                timestamp: msg.created_at
              }));
              setMessages(convertedMessages);
            } else {
              // Initialize with introduction if no messages exist
              if (adventureData.introduction) {
                const introMessage: StoryMessage = {
                  id: 'intro',
                  content: adventureData.introduction,
                  isUser: false,
                  choices: [
                    "Start the adventure",
                    "Learn more about the world"
                  ],
                  timestamp: new Date().toISOString()
                };
                setMessages([introMessage]);

                // Save intro message to database
                await addAdventureMessage(
                  adventureId,
                  existingConv.id,
                  adventureData.introduction,
                  true,
                  null,
                  'intro',
                  ["Start the adventure", "Learn more about the world"]
                );
              }
            }
          } else {
            // Create new conversation
            const newConversation = await createAdventureConversation(
              user.id,
              adventureId,
              null,
              adventureData.name
            );
            setConversationId(newConversation.id);

            // Initialize with introduction message
            if (adventureData.introduction) {
              const introMessage: StoryMessage = {
                id: 'intro',
                content: adventureData.introduction,
                isUser: false,
                choices: [
                  "Start the adventure",
                  "Learn more about the world"
                ],
                timestamp: new Date().toISOString()
              };
              setMessages([introMessage]);

              // Save intro message to database
              await addAdventureMessage(
                adventureId,
                newConversation.id,
                adventureData.introduction,
                true,
                null,
                'intro',
                ["Start the adventure", "Learn more about the world"]
              );
            }
          }
        } else {
          // Guest mode - just show intro without saving
          if (adventureData.introduction) {
            const introMessage: StoryMessage = {
              id: 'intro',
              content: adventureData.introduction,
              isUser: false,
              choices: [
                "Start the adventure",
                "Learn more about the world"
              ],
              timestamp: new Date().toISOString()
            };
            setMessages([introMessage]);
          }
        }
      } catch (error) {
        console.error('Error loading adventure:', error);
        toast.error('Failed to load adventure');
        navigate('/');
      } finally {
        setIsLoadingAdventure(false);
      }
    };

    loadAdventure();
  }, [adventureId, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    if (!adventure) return '';

    let systemPrompt = `You are an AI game master running an interactive adventure story. The adventure is titled "${adventure.name}".

Plot: ${adventure.plot}

${adventure.story_summary ? `Story Summary: ${adventure.story_summary}` : ''}

${adventure.plot_essentials ? `Important Plot Elements: ${adventure.plot_essentials}` : ''}

${adventure.ai_instructions ? `Special Instructions: ${adventure.ai_instructions}` : ''}

${adventure.persona ? `The player is: ${adventure.persona}` : ''}

${adventure.story_cards && adventure.story_cards.length > 0 ? 
  `Story Elements:\n${adventure.story_cards.map(card => `- ${card.type}: ${card.name} - ${card.description}`).join('\n')}` : ''}

Guidelines:
- Keep responses engaging and immersive
- Provide 2 meaningful choices for the player at the end of each response
- Maintain story consistency and character development
- Adapt the story based on player choices
- Keep responses concise but descriptive
- End with "What happens next? Choose your path" followed by two choice options

Format your response as regular narrative text, then end with exactly two choices for the player.`;

    return systemPrompt;
  };

  const handleChoice = async (choice: string) => {
    if (!adventure || !user) return;

    setIsLoading(true);
    
    try {
      // Ensure user exists in Supabase
      await createOrUpdateUser(user);

      // Add user choice message
      const userMessage: StoryMessage = {
        id: Date.now().toString(),
        content: choice,
        isUser: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database if logged in
      if (conversationId) {
        await addAdventureMessage(
          adventureId,
          conversationId,
          choice,
          false,
          user.id,
          'regular'
        );
      }

      // Prepare messages for AI
      const systemPrompt = buildSystemPrompt();
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...recentMessages,
        { role: 'user', content: choice }
      ];

      // Build roleplay context
      const roleplayContext = {
        adventure_id: adventureId || 'unknown',
        character_name: adventure.name,
        source_story: adventure.name,
        current_location: 'Adventure World',
        active_characters: [adventure.name],
        story_state: {
          recent_choices: messages.slice(-3).map(msg => msg.content),
          current_scene: choice
        },
        canonical_info: {
          plot: adventure.plot,
          introduction: adventure.introduction,
          story_summary: adventure.story_summary,
          plot_essentials: adventure.plot_essentials
        }
      };

      // Use specific model for adventure play
      const adventureModel = {
        id: 'tngtech/deepseek-r1t2-chimera:free',
        name: 'tngtech/deepseek-r1t2-chimera:free',
        provider: 'OpenRouter',
        maxTokens: 8192,
        description: 'Adventure AI Model'
      };

      const aiResponse = await openRouterAPI.createChatCompletion(
        adventureModel,
        chatMessages as any,
        {
          temperature: 0.85,
          max_tokens: settings.lengthMode === 'extended' ? 600 : 300,
          frequency_penalty: 0.3,
          presence_penalty: 0.6
        }
      );

      if (aiResponse && aiResponse.choices && aiResponse.choices[0]) {
        const aiContent = aiResponse.choices[0].message.content;
        
        // Enhanced choice generation using AI
        let extractedChoices: string[] = [];
        let mainContent = aiContent;

        try {
          // Try to extract choices from response or generate new ones
          const choicePattern = /(?:What happens next\?.*?Choose your path|Choose your path)[\s\S]*?(\d+\..*?)(?:\n|$)[\s\S]*?(\d+\..*?)(?:\n|$)/i;
          const choiceMatch = aiContent.match(choicePattern);

          if (choiceMatch) {
            extractedChoices = [
              choiceMatch[1].replace(/^\d+\.\s*/, '').trim(),
              choiceMatch[2].replace(/^\d+\.\s*/, '').trim()
            ];
            mainContent = aiContent.replace(/(?:What happens next\?.*?Choose your path)[\s\S]*$/i, '').trim();
          } else {
            // Generate choices using AI if not found in response
            try {
              const choicePrompt = `Based on this story situation: "${aiContent}"

              Generate exactly 2 interesting and meaningful choices for the player to continue the adventure. Each choice should be:
              - Action-oriented
              - Different from each other
              - Lead to interesting story development

              Format as:
              1. [First choice]
              2. [Second choice]`;

              const choiceResponse = await openRouterAPI.createChatCompletion(
                adventureModel,
                [{ role: 'user', content: choicePrompt }] as any,
                {
                  temperature: 0.7,
                  max_tokens: 100
                }
              );

              if (choiceResponse && choiceResponse.choices && choiceResponse.choices[0]) {
                const choicesText = choiceResponse.choices[0].message.content;
                const choiceMatches = choicesText.match(/\d+\.\s*(.+)/g);
                if (choiceMatches && choiceMatches.length >= 2) {
                  extractedChoices = choiceMatches.slice(0, 2).map(match =>
                    match.replace(/^\d+\.\s*/, '').trim()
                  );
                }
              }
            } catch (error) {
              console.warn('Choice generation failed:', error);
            }
          }
        } catch (error) {
          console.warn('Choice generation failed, using defaults:', error);
          extractedChoices = ["Continue forward", "Look around carefully"];
        }

        // Fallback choices if generation failed
        if (extractedChoices.length === 0) {
          extractedChoices = ["Continue forward", "Look around carefully"];
        }

        const aiMessage: StoryMessage = {
          id: (Date.now() + 1).toString(),
          content: mainContent,
          isUser: false,
          choices: extractedChoices,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error processing choice:', error);
      toast.error('Failed to process your choice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomInput = async () => {
    if (!customInput.trim() || isLoading) return;
    
    const input = customInput.trim();
    setCustomInput('');
    
    await handleChoice(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomInput();
    }
  };

  if (isLoadingAdventure) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading adventure...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!adventure) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Adventure not found</h2>
            <Button onClick={() => navigate('/')}>Go back home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-primary font-medium text-sm truncate max-w-[200px]">
                {adventure.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary hover:bg-primary/10"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-primary hover:bg-primary/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Background Image */}
        {adventure.background_image_url && (
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 -z-10"
            style={{ backgroundImage: `url(${adventure.background_image_url})` }}
          />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* Message Content */}
                <div className={`${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div 
                    className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>

                {/* Choices */}
                {message.choices && !message.isUser && (
                  <div className="space-y-3 mt-6">
                    <p className="text-center text-sm font-medium text-muted-foreground">
                      What happens next? Choose your path
                    </p>
                    <div className="space-y-2">
                      {message.choices.map((choice, index) => (
                        <Button
                          key={index}
                          onClick={() => handleChoice(choice)}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-[#e74c8c] to-[#c44f93] hover:from-[#d63384] hover:to-[#b83e88] text-white rounded-full py-3 h-auto text-sm font-medium disabled:opacity-50"
                          style={{ fontSize: `${Math.max(settings.fontSize - 2, 12)}px` }}
                        >
                          {choice}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Custom Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="You can enter a custom storyline"
                disabled={isLoading}
                className="pr-12 bg-secondary/50 border-border rounded-full h-12 text-sm placeholder:text-muted-foreground/70"
                style={{ fontSize: `${Math.max(settings.fontSize - 2, 12)}px` }}
              />
              <Button
                onClick={handleCustomInput}
                disabled={!customInput.trim() || isLoading}
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <AdventureSettingsModal
          open={showSettings}
          onOpenChange={setShowSettings}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </Layout>
  );
};

export default AdventurePlay;
