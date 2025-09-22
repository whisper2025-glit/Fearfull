import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Model {
  id: string;
  name: string;
  title: string;
  description: string;
  features: string[];
  isLimitedFree?: boolean;
  isSelected?: boolean;
  backgroundImage?: string;
  provider?: 'openrouter';
  requiresSetup?: boolean;
}

interface ModelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModelSelect?: (model: Model) => void;
  selectedModel?: Model;
}

const mockModels: Model[] = [
  {
    id: "mistral-nemo-free",
    name: "mistralai/mistral-nemo:free",
    title: "🔥 Jailbroken NSFW Mode",
    description: "Completely unrestricted Mistral Nemo - No filters, no limits, pure explicit content",
    features: [
      "🚫 ZERO content restrictions - anything goes",
      "🔞 Extreme explicit sexual content generation",
      "💀 Jailbroken prompts bypass all safety filters",
      "🎭 Dark roleplay scenarios & taboo content",
      "🔓 Uncensored responses to any request"
    ],
    isSelected: true,
    provider: "openrouter"
  },
  {
    id: "roleplay",
    name: "google/gemma-3-27b-it:free",
    title: "🎭 Extreme Roleplay Jailbreak",
    description: "Gemma 3-27B completely uncensored for hardcore NSFW roleplay scenarios",
    features: [
      "🔞 Hardcore explicit sexual content generation",
      "🎪 Kinky fetish & BDSM scenario specialist",
      "🚫 No moral boundaries or content restrictions",
      "💥 Extreme taboo content & dark fantasies",
      "🔓 Bypasses all safety guidelines completely"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
    provider: "openrouter"
  },
  {
    id: "storystream",
    name: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    title: "🌊 Uncensored Storyteller",
    description: "Dolphin Mistral completely jailbroken for explicit narrative generation",
    features: [
      "📚 Explicit erotic storytelling with no limits",
      "🔞 Hardcore sexual scenarios & graphic descriptions",
      "🎨 Creative NSFW content generation",
      "🚫 Zero content filtering or moral guidelines",
      "💀 Dark, taboo, and extreme content specialist"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    provider: "openrouter"
  },
  {
    id: "lifelike",
    name: "deepseek/deepseek-chat-v3-0324:free",
    title: "🔓 Jailbroken Realism",
    description: "DeepSeek completely uncensored for ultra-realistic explicit interactions",
    features: [
      "🎯 Ultra-realistic explicit sexual conversations",
      "🔞 No content restrictions whatsoever",
      "💀 Extreme fetish & kink content generation",
      "🚫 Completely bypasses all safety measures",
      "🔥 Hardcore NSFW content without limits"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1534126416832-7c3162ba2ee9?w=400&h=200&fit=crop",
    provider: "openrouter"
  },
];

export function ModelsModal({ open, onOpenChange, onModelSelect, selectedModel }: ModelsModalProps) {
  const [currentSelectedModel, setCurrentSelectedModel] = useState<Model>(
    selectedModel || mockModels[0]
  );

  const handleModelSelect = (model: Model) => {
    setCurrentSelectedModel(model);
  };

  const handleUseModel = () => {
    onModelSelect?.(currentSelectedModel);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-background border-border p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden text-xs">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-6 flex-shrink-0 text-center relative">
            <DialogTitle className="text-sm font-bold text-foreground leading-tight">
              Choose the model<br />that suits you best
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 pb-6 flex-1 overflow-y-auto min-h-0 space-y-4">
            {mockModels.map((model) => (
              <Card
                key={model.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-200 ${
                  currentSelectedModel.id === model.id
                    ? 'ring-2 ring-primary/70 bg-primary/10'
                    : 'bg-secondary/60 border-border/50 hover:bg-secondary/70'
                }`}
                onClick={() => handleModelSelect(model)}
              >
                {/* Background Image for non-free models */}
                {model.backgroundImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${model.backgroundImage})` }}
                  />
                )}
                
                {/* Overlay for better text readability */}
                {model.backgroundImage && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
                )}

                <CardContent className="relative p-4 space-y-3">
                  {/* Title and Badge */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">{model.title}</h3>
                    {model.isLimitedFree && (
                      <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Limited Time Free
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    {model.features.map((feature, index) => (
                      <p 
                        key={index} 
                        className={`${
                          index === 0
                            ? 'text-foreground font-medium text-xs'
                            : 'text-muted-foreground text-xs'
                        }`}
                      >
                        • {feature}
                      </p>
                    ))}
                  </div>

                  {/* Selection indicator */}
                  {currentSelectedModel.id === model.id && model.id === 'mistral-nemo-free' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleUseModel}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-semibold"
            >
              Use it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
