import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setUserContentLevel, ContentLevel } from "@/lib/contentFilter";
import { Shield, Users, Flame } from "lucide-react";

interface PreferencesOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesOnboardingModal = ({ isOpen, onClose }: PreferencesOnboardingModalProps) => {
  const [selectedLevel, setSelectedLevel] = useState<ContentLevel | null>(null);

  const contentLevels = [
    {
      id: 'sfw' as ContentLevel,
      title: 'Safe For Work',
      description: 'Family-friendly content only',
      icon: Shield,
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      ageRange: '13+',
    },
    {
      id: 'moderate' as ContentLevel,
      title: 'Adult Content',
      description: 'Mature themes and romantic content',
      icon: Users,
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      ageRange: '18+',
    },
    {
      id: 'unrestricted' as ContentLevel,
      title: 'Unrestricted',
      description: 'All content types including NSFW',
      icon: Flame,
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      ageRange: '21+',
    },
  ];

  const handleSave = () => {
    if (selectedLevel) {
      setUserContentLevel(selectedLevel);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Content Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Select the type of content you'd like to see. You can change this later in settings.
          </p>

          {contentLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card 
                key={level.id}
                className={`cursor-pointer transition-all border-2 ${
                  selectedLevel === level.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${level.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{level.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {level.ageRange}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Skip
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedLevel}
            className="flex-1"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesOnboardingModal;