import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getDefaultChatSettings, ChatSettings } from "@/lib/supabase";
import { openRouterAI } from "@/lib/ai-client";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ChatSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: (settings: ChatSettings) => void;
}

export function ChatSettingsModal({ open, onOpenChange, onSettingsChange }: ChatSettingsModalProps) {
  const { user } = useUser();
  const [temperature, setTemperature] = useState([0.70]);
  const [contentDiversity, setContentDiversity] = useState([0.05]);
  const [maxMessageLength, setMaxMessageLength] = useState([195]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load default settings when modal opens
  useEffect(() => {
    const loadSettings = async () => {
      if (!open || !user) return;

      setIsLoading(true);
      try {
        // Use default settings since we removed model-specific settings
        const defaults = getDefaultChatSettings();
        setTemperature([defaults.temperature]);
        setContentDiversity([defaults.content_diversity]);
        setMaxMessageLength([defaults.max_tokens]);
        console.log('📋 Using default chat settings');
      } catch (error) {
        console.error('❌ Error loading chat settings:', error);
        toast.error('Failed to load chat settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [open, user]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save settings');
      return;
    }

    setIsSaving(true);
    try {
      const settings: ChatSettings = {
        user_id: user.id,
        model_id: 'default',
        temperature: temperature[0],
        content_diversity: contentDiversity[0],
        max_tokens: maxMessageLength[0]
      };

      console.log('✅ Chat settings updated:', settings);
      toast.success('Chat settings updated successfully!');
      onSettingsChange?.(settings);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error saving chat settings:', error);
      toast.error('Failed to save chat settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2"
                style={{ fontSize: '12px' }}
              >
                <Save className="h-3 w-3" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <DialogTitle className="text-lg font-bold text-white flex-1 text-center" style={{ fontSize: '18px' }}>
                Chat Settings
              </DialogTitle>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6 flex-1 overflow-y-auto min-h-0 pr-1 max-h-full">
            {/* Parameters */}
            <div>
              <div className="mb-4">
                <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                  Chat Parameters
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Customize your chat experience with these settings
                </p>
              </div>

              {/* Temperature */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-white" style={{ fontSize: '12px' }}>Temperature</h4>
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="bg-cyan-600 text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {temperature[0].toFixed(2)}
                </div>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mb-2"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-400" style={{ fontSize: '11px' }}>
                  <span>Rigid</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Content Diversity */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-white" style={{ fontSize: '12px' }}>Content Diversity</h4>
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="bg-cyan-600 text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {contentDiversity[0].toFixed(2)}
                </div>
                <Slider
                  value={contentDiversity}
                  onValueChange={setContentDiversity}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mb-2"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-400" style={{ fontSize: '11px' }}>
                  <span>Repetitive</span>
                  <span>Diverse</span>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div>
              <h3 className="text-cyan-400 font-semibold mb-4" style={{ fontSize: '14px' }}>
                Message Settings
              </h3>

              {/* Max message length */}
              <div className="mb-4">
                <div className="mb-2">
                  <h4 className="text-white font-medium" style={{ fontSize: '14px' }}>
                    Max message length
                  </h4>
                </div>
                <p className="text-gray-400 mb-3" style={{ fontSize: '12px' }}>
                  The maximum length for chat messages. Longer messages allow for more detailed conversations.
                </p>
                <div className="bg-cyan-600 text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {maxMessageLength[0]} tokens
                </div>
                <Slider
                  value={maxMessageLength}
                  onValueChange={setMaxMessageLength}
                  max={650}
                  min={195}
                  step={5}
                  className="mb-2"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-400" style={{ fontSize: '11px' }}>
                  <span>195</span>
                  <span>650</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] hover:from-[#0891b2] hover:to-[#0e7490] text-white rounded-lg"
              >
                {isSaving ? 'Saving...' : 'Apply Settings'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
