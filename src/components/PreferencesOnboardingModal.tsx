
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PreferencesOnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const PreferencesOnboardingModal: React.FC<PreferencesOnboardingModalProps> = ({ 
  open, 
  onComplete 
}) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    pronoun: '',
    ageRange: '',
    relationshipPreference: ''
  });

  const pronounOptions = [
    { value: 'she/her', label: 'She/Her', icon: '♀' },
    { value: 'he/him', label: 'He/Him', icon: '♂' },
    { value: 'they/them', label: 'They/Them', icon: '*' }
  ];

  const ageOptions = [
    { value: 'below-18', label: 'Below 18' },
    { value: '18-20', label: '18-20' },
    { value: '21-23', label: '21-23' },
    { value: '24-26', label: '24-26' },
    { value: 'above-26', label: 'Above 26' }
  ];

  const relationshipOptions = [
    { value: 'male', label: 'Male', icon: '😊' },
    { value: 'female', label: 'Female', icon: '😊' },
    { value: 'non-binary', label: 'Non-binary', icon: '🌈' }
  ];

  const handleSelection = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Save preferences to user profile
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            pronoun: preferences.pronoun,
            age_range: preferences.ageRange,
            relationship_preference: preferences.relationshipPreference,
            nsfw_level: getContentLevel(preferences.ageRange)
          },
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
        return;
      }

      // Store in localStorage for immediate access
      localStorage.setItem('user_content_level', getContentLevel(preferences.ageRange));
      localStorage.setItem('user_age_range', preferences.ageRange);
      
      toast.success('Preferences saved successfully!');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup');
    }
  };

  const getContentLevel = (ageRange: string): string => {
    if (ageRange === 'below-18') return 'sfw';
    if (ageRange === '18-20') return 'moderate';
    return 'unrestricted';
  };

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.pronoun !== '';
      case 2: return preferences.ageRange !== '';
      case 3: return preferences.relationshipPreference !== '';
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-[#1a1b2e] border-[#2d2e3e] text-white p-0 rounded-2xl"
        hideCloseButton
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold">
              {step === 1 && "Hi, Welcome to Talkie"}
              {step === 2 && "What's you age?"}
              {step === 3 && "What's your relationship preference?"}
            </DialogTitle>
            {step === 1 && (
              <p className="text-gray-400 text-sm">
                Tell us more for a better personalized experience
              </p>
            )}
          </DialogHeader>

          {/* Step 1: Pronouns */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-white font-medium">Which pronoun do you use? *</h3>
              <div className="flex gap-3">
                {pronounOptions.map((option) => (
                  <Card
                    key={option.value}
                    className={`flex-1 p-4 cursor-pointer text-center transition-all ${
                      preferences.pronoun === option.value
                        ? 'bg-primary border-primary text-white'
                        : 'bg-[#2d2e3e] border-[#3d3e4e] text-gray-300 hover:bg-[#34354a]'
                    }`}
                    onClick={() => handleSelection('pronoun', option.value)}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-white font-medium">What's you age? *</h3>
              <div className="grid grid-cols-2 gap-3">
                {ageOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={preferences.ageRange === option.value ? "default" : "outline"}
                    className={`h-12 text-sm ${
                      preferences.ageRange === option.value
                        ? 'bg-primary text-white'
                        : 'bg-[#2d2e3e] border-[#3d3e4e] text-gray-300 hover:bg-[#34354a]'
                    }`}
                    onClick={() => handleSelection('ageRange', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Relationship Preference */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-white font-medium">What's your relationship preference?</h3>
              <div className="space-y-3">
                {relationshipOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={preferences.relationshipPreference === option.value ? "default" : "outline"}
                    className={`w-full h-12 justify-start text-sm ${
                      preferences.relationshipPreference === option.value
                        ? 'bg-primary text-white'
                        : 'bg-[#2d2e3e] border-[#3d3e4e] text-gray-300 hover:bg-[#34354a]'
                    }`}
                    onClick={() => handleSelection('relationshipPreference', option.value)}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-4">
            {step < 3 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-medium"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-medium"
              >
                Enter Talkie Now!
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  stepNum <= step ? 'bg-primary' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesOnboardingModal;
