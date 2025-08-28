import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon } from "lucide-react";

interface AdventureSettings {
  fontSize: number;
  theme: 'dark' | 'light';
  storyMode: 'interactive' | 'reading';
  lengthMode: 'standard' | 'extended';
}

interface AdventureSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AdventureSettings;
  onSettingsChange: (settings: AdventureSettings) => void;
}

export function AdventureSettingsModal({ 
  open, 
  onOpenChange, 
  settings, 
  onSettingsChange 
}: AdventureSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AdventureSettings>(settings);

  const handleSettingChange = (key: keyof AdventureSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center">
              <DialogTitle className="text-lg font-bold text-[#e74c8c]" style={{ fontSize: '18px' }}>
                Adventure Settings
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-4 flex-1 overflow-y-auto space-y-6">
            {/* Font Size */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300" style={{ fontSize: '14px' }}>
                Font size
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-400">A-</span>
                <div className="flex-1 mx-4">
                  <Slider
                    value={[localSettings.fontSize]}
                    onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-lg text-gray-400">A+</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-white" style={{ fontSize: `${localSettings.fontSize}px` }}>
                  {localSettings.fontSize}
                </span>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300" style={{ fontSize: '14px' }}>
                Theme
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={localSettings.theme === 'dark' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 flex items-center justify-center gap-2 ${
                    localSettings.theme === 'dark'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('theme', 'dark')}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={localSettings.theme === 'light' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 flex items-center justify-center gap-2 ${
                    localSettings.theme === 'light'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('theme', 'light')}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
              </div>
            </div>

            {/* Story Mode */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300" style={{ fontSize: '14px' }}>
                Story Mode
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={localSettings.storyMode === 'interactive' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 ${
                    localSettings.storyMode === 'interactive'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('storyMode', 'interactive')}
                >
                  Interactive Mode
                </Button>
                <Button
                  variant={localSettings.storyMode === 'reading' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 ${
                    localSettings.storyMode === 'reading'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('storyMode', 'reading')}
                >
                  Reading Mode
                </Button>
              </div>
            </div>

            {/* Length Mode */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300" style={{ fontSize: '14px' }}>
                Length Mode
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={localSettings.lengthMode === 'standard' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 ${
                    localSettings.lengthMode === 'standard'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('lengthMode', 'standard')}
                >
                  Standard
                </Button>
                <Button
                  variant={localSettings.lengthMode === 'extended' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-2xl text-xs font-medium py-3 border-0 relative ${
                    localSettings.lengthMode === 'extended'
                      ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                      : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSettingChange('lengthMode', 'extended')}
                >
                  Extended
                  <Badge 
                    className="absolute -top-1 -right-1 bg-[#ffa500] text-black text-xs px-1 py-0.5 rounded-full"
                    style={{ fontSize: '8px' }}
                  >
                    Pro
                  </Badge>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#2d2e3e] flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-[#2d2e3e] border-[#3d3e4e] text-white hover:bg-[#34354a] rounded-lg py-2"
                onClick={() => onOpenChange(false)}
                style={{ fontSize: '12px' }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#e74c8c] to-[#c44f93] hover:from-[#d63384] hover:to-[#b83e88] text-white rounded-lg py-2"
                onClick={handleSave}
                style={{ fontSize: '12px' }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
