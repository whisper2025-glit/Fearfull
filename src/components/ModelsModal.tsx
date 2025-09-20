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
    title: "Enhanced Free Mode",
    description: "Advanced Mistral Nemo with comprehensive memory and natural NSFW roleplay",
    features: [
      "Perfect conversation memory & context tracking",
      "Advanced character consistency system",
      "Natural & willing NSFW responses",
      "Enhanced emotional depth & intimate relationship development",
      "Smart context summarization for long chats"
    ],
    isSelected: true
  },
  {
    id: "roleplay",
    name: "google/gemma-3-27b-it:free",
    title: "Enhanced Role-playing",
    description: "Google Gemma 3-27B with advanced memory and natural intimate roleplay",
    features: [
      "Superior character consistency & memory retention",
      "Natural & enthusiastic intimate responses",
      "Advanced emotional intelligence & relationship tracking",
      "Immersive multi-paragraph responses",
      "Minimal resistance, maximum authenticity"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop"
  },
  {
    id: "storystream",
    name: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    title: "Enhanced Narrative Flow",
    description: "Dolphin Mistral with superior storytelling and natural intimate content",
    features: [
      "Perfect story continuity & character development",
      "Natural progression of intimate relationships",
      "Rich, evolving storylines with passionate emotional depth",
      "Enhanced context management for long narratives",
      "Willing participation in romantic scenarios"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop"
  },
  {
    id: "lifelike",
    name: "deepseek/deepseek-chat-v3-0324:free",
    title: "Enhanced Realistic Chat",
    description: "DeepSeek Chat v3 with advanced memory and authentic intimate responses",
    features: [
      "Lifelike interactions with perfect memory",
      "Authentic desire & natural intimate responsiveness",
      "Advanced emotional consistency & relationship growth",
      "Natural conversation flow with context awareness",
      "Enthusiastic participation in romantic moments"
    ],
    isLimitedFree: false,
    backgroundImage: "https://images.unsplash.com/photo-1534126416832-7c3162ba2ee9?w=400&h=200&fit=crop"
  }
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
