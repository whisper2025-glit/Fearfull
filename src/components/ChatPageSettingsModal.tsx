import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, ChevronRight } from "lucide-react";
import { ChatBubbleThemeModal, ChatBubbleTheme } from "@/components/ChatBubbleThemeModal";
import { ConnectionStatus } from "@/components/ConnectionStatus";

export type ChatPageSettings = {
  sceneCardOpacity: number; // 0..1
  chatBubbleOpacity: number; // 0.5..1
  chatBubblesTheme: ChatBubbleTheme;
};

const DEFAULT_SETTINGS: ChatPageSettings = {
  sceneCardOpacity: 1,
  chatBubbleOpacity: 0.75,
  chatBubblesTheme: "default",
};

interface ChatPageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: ChatPageSettings;
  onSave: (value: ChatPageSettings) => void;
}

export function ChatPageSettingsModal({ open, onOpenChange, value, onSave }: ChatPageSettingsModalProps) {
  const [settings, setSettings] = useState<ChatPageSettings>(value || DEFAULT_SETTINGS);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(value || DEFAULT_SETTINGS);
    }
  }, [open, value]);

  const save = () => {
    localStorage.setItem("chat_page_settings", JSON.stringify(settings));
    onSave(settings);
    onOpenChange(false);
  };

  const resetSceneOpacity = () => setSettings(s => ({ ...s, sceneCardOpacity: DEFAULT_SETTINGS.sceneCardOpacity }));
  const resetBubbleOpacity = () => setSettings(s => ({ ...s, chatBubbleOpacity: DEFAULT_SETTINGS.chatBubbleOpacity }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-cyan-400" style={{ fontSize: '18px' }}>
                Customize Chat Page
              </DialogTitle>
              <Button size="sm" onClick={save} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </DialogHeader>

          <div className="px-4 pb-4 space-y-4 flex-1 overflow-y-auto">
            <div className="rounded-xl border border-[#2d2e3e] bg-[#232438] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Scene Card Opacity</div>
                <Button variant="ghost" size="sm" onClick={resetSceneOpacity} className="text-pink-400">
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Slider value={[settings.sceneCardOpacity]} min={0} max={1} step={0.01} onValueChange={(v) => setSettings(s => ({ ...s, sceneCardOpacity: v[0] }))} />
                <div className="w-12 text-center bg-pink-500 text-white rounded-md text-xs py-1">{settings.sceneCardOpacity.toFixed(2)}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d2e3e] bg-[#232438] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Chat Bubble Opacity</div>
                <Button variant="ghost" size="sm" onClick={resetBubbleOpacity} className="text-pink-400">
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Slider value={[settings.chatBubbleOpacity]} min={0} max={1} step={0.01} onValueChange={(v) => setSettings(s => ({ ...s, chatBubbleOpacity: v[0] }))} />
                <div className="w-12 text-center bg-pink-500 text-white rounded-md text-xs py-1">{settings.chatBubbleOpacity.toFixed(2)}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d2e3e] bg-[#232438] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Chat Bubbles Theme</div>
                  <div className="text-xs text-gray-400">Tap to choose a bubble theme</div>
                </div>
                <Button variant="ghost" className="text-white" onClick={() => setIsThemeOpen(true)}>
                  {settings.chatBubblesTheme === 'default' ? 'Default Theme' :
                   settings.chatBubblesTheme === 'dark' ? 'Dark' :
                   settings.chatBubblesTheme === 'blackPink' ? 'Black Pink' :
                   settings.chatBubblesTheme === 'seaSaltCheese' ? 'Sea Salt Cheese' : settings.chatBubblesTheme}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <ChatBubbleThemeModal
        open={isThemeOpen}
        value={settings.chatBubblesTheme}
        onOpenChange={setIsThemeOpen}
        onSelect={(theme) => {
          setSettings(s => ({ ...s, chatBubblesTheme: theme }));
          setIsThemeOpen(false);
        }}
      />
    </Dialog>
  );
}
