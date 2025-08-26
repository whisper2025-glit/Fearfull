import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, MessageCircle } from "lucide-react";
import { openRouterAPI, ChatMessage } from "@/lib/openrouter";
import { Model } from "./ModelsModal";
import { toast } from "sonner";

interface SuggestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionSelect: (suggestion: string) => void;
  chatContext: {
    characterName: string;
    characterIntro: string;
    characterScenario?: string;
    recentMessages: Array<{
      content: string;
      isBot: boolean;
    }>;
    personaName?: string;
    personaDescription?: string;
  };
}

const DEEPSEEK_MODEL: Model = {
  id: "deepseek-suggest",
  name: "deepseek/deepseek-r1-0528-qwen3-8b:free",
  author: "DeepSeek",
  description: "AI suggestion generator for roleplay",
  price: 0,
  responseTime: "1s",
  memory: "8B",
  rating: 8.0,
  tags: ["Suggestion", "Roleplay"],
  isActive: true,
  isPremium: false,
  isMain: false,
  provider: 'deepseek',
  tier: 'standard'
};

export function SuggestModal({ open, onOpenChange, onSuggestionSelect, chatContext }: SuggestModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [open]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const systemPrompt = createSuggestionPrompt();
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Generate 3 roleplay response suggestions based on the current conversation context.'
        }
      ];

      const response = await openRouterAPI.createChatCompletion(DEEPSEEK_MODEL, chatMessages, {
        temperature: 0.8,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content || "";
      const parsedSuggestions = parseSuggestions(content);
      
      if (parsedSuggestions.length === 0) {
        throw new Error("No valid suggestions generated");
      }
      
      setSuggestions(parsedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions. Please try again.');
      
      // Fallback suggestions
      setSuggestions([
        "That's interesting! Can you tell me more about that?",
        "I'd love to hear your thoughts on this situation.",
        "What do you think we should do next?"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const createSuggestionPrompt = () => {
    const { characterName, characterIntro, characterScenario, recentMessages, personaName, personaDescription } = chatContext;
    
    let prompt = `You are an AI assistant that generates roleplay response suggestions. Your task is to create 3 diverse, engaging response options that the USER can send to continue the roleplay conversation naturally.

CHARACTER CONTEXT:
- Character Name: ${characterName}
- Character Description: ${characterIntro}`;

    if (characterScenario) {
      prompt += `\n- Scenario: ${characterScenario}`;
    }

    if (personaName && personaDescription) {
      prompt += `\n\nUSER PERSONA:
- Name: ${personaName}
- Description: ${personaDescription}`;
    }

    if (recentMessages.length > 0) {
      prompt += `\n\nRECENT CONVERSATION:`;
      recentMessages.slice(-6).forEach((msg, index) => {
        const speaker = msg.isBot ? characterName : (personaName || "You");
        prompt += `\n${speaker}: "${msg.content}"`;
      });
    }

    prompt += `\n\nINSTRUCTIONS:
- Generate exactly 3 different response suggestions for the USER (not the character)
- Each suggestion should be 1-2 sentences long
- Make them diverse in tone: one casual/friendly, one curious/inquisitive, one action-oriented
- Keep them appropriate for the roleplay context
- Make them feel natural and engaging
- Format each suggestion on a separate line starting with a number (1., 2., 3.)
- Do not include quotes around the suggestions
- Focus on what the USER should say, not what the character should say

Example format:
1. That sounds fascinating! I'd love to learn more about your experiences.
2. What made you decide to take that path?
3. Let's explore this place together - lead the way!`;

    return prompt;
  };

  const parseSuggestions = (content: string): string[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const suggestions: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for numbered suggestions (1., 2., 3.) or similar patterns
      const match = trimmed.match(/^[1-3][\.\)\-\:]?\s*(.+)$/);
      if (match && match[1]) {
        const suggestion = match[1].trim();
        if (suggestion.length > 10 && suggestion.length < 200) {
          suggestions.push(suggestion);
        }
      }
    }

    // If we couldn't parse numbered suggestions, try to split by common delimiters
    if (suggestions.length === 0) {
      const parts = content.split(/\n\n|\n-|\n\*/).filter(part => part.trim().length > 10);
      return parts.slice(0, 3).map(part => part.trim());
    }

    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    onOpenChange(false);
  };

  const handleRefresh = () => {
    setSuggestions([]);
    generateSuggestions();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[70vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-4 flex-shrink-0 border-b border-[#2d2e3e]">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#e74c8c]" />
              <DialogTitle className="text-lg font-bold text-[#e74c8c]">
                Response Suggestions
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Click any suggestion to send it immediately
            </p>
          </DialogHeader>

          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#e74c8c]" />
                <p className="text-gray-400 text-sm">Generating suggestions...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="bg-[#232438] border-[#2d2e3e] hover:border-[#e74c8c]/60 cursor-pointer transition-all duration-200 hover:bg-[#2a2b42]"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-[#e74c8c]/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-[#e74c8c]">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm leading-relaxed">
                            {suggestion}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to send
                          </p>
                        </div>
                        <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {suggestions.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No suggestions available</p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="bg-[#2d2e3e] border-[#3d3e4e] text-white hover:bg-[#34354a]"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#2d2e3e] flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-[#2d2e3e] border-[#3d3e4e] text-white hover:bg-[#34354a] rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#e74c8c] to-[#c44f93] hover:from-[#d63384] hover:to-[#b83e88] text-white rounded-lg"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
