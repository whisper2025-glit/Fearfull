import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
    title: "Free Model",
    description: "Mistral Nemo (free) via OpenRouter",
    features: [
      "Mistral Nemo free on OpenRouter",
      "Character-aware roleplay"
    ],
    isSelected: true
  },
  {
    id: "roleplay",
    name: "deepseek/deepseek-r1-0528",
    title: "Roleplay",
    description: "DeepSeek R1 0528 via OpenRouter",
    features: [
      "Deep reasoning for immersive roleplay",
      "Character-consistent, expressive replies"
    ],
    isLimitedFree: true,
    backgroundImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop"
  },
  {
    id: "storystream",
    name: "deepseek/deepseek-chat-v3-0324",
    title: "StoryStream",
    description: "DeepSeek Chat v3 0324 via OpenRouter",
    features: [
      "Coherent long-form story continuation",
      "Rich, evolving plots and scenes"
    ],
    isLimitedFree: true,
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop"
  },
  {
    id: "lifelike",
    name: "Lifelike",
    title: "Lifelike",
    description: "Human-like, lifelike interactions",
    features: [
      "Human-like, lifelike interactions",
      "Responses flow naturally"
    ],
    isLimitedFree: true,
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
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden text-xs">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-6 flex-shrink-0 text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-sm font-bold text-white leading-tight">
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
                    ? 'ring-2 ring-blue-500 bg-blue-500/10'
                    : 'bg-[#2d2e3e] border-[#3d3e4e] hover:bg-[#34354a]'
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
                    <h3 className="text-sm font-bold text-white">{model.title}</h3>
                    {model.isLimitedFree && (
                      <Badge className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
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
                            ? 'text-white font-medium text-xs'
                            : 'text-gray-300 text-xs'
                        }`}
                      >
                        • {feature}
                      </p>
                    ))}
                  </div>

                  {/* Selection indicator */}
                  {currentSelectedModel.id === model.id && model.id === 'mistral-nemo-free' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold"
            >
              Use it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
