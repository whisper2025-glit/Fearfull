import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FileText, RotateCcw } from "lucide-react";

interface ChatSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSettingsModal({ open, onOpenChange }: ChatSettingsModalProps) {
  const [language, setLanguage] = useState("english");
  const [temperature, setTemperature] = useState([0.0]);
  const [contentDiversity, setContentDiversity] = useState([0.05]);
  const [textStreaming, setTextStreaming] = useState(false);
  const [scenarioBasedExperience, setScenarioBasedExperience] = useState(true);
  const [maxMessageLength, setMaxMessageLength] = useState([225]);

  const handleReset = () => {
    setTemperature([0.0]);
    setContentDiversity([0.05]);
    setMaxMessageLength([225]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white" style={{ fontSize: '18px' }}>
              Chat Setting
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6 flex-1 overflow-y-auto min-h-0 pr-1 max-h-full">
            {/* Model Settings */}
            <div>
              <div className="mb-4">
                <h3 className="text-[#e74c8c] font-semibold" style={{ fontSize: '14px' }}>
                  Model Settings
                </h3>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium" style={{ fontSize: '14px' }}>
                  Choose your model
                </h4>
                <p className="text-gray-400" style={{ fontSize: '12px' }}>
                  Each model may have different effects. We are still working on getting better models.
                </p>
                
                {/* Current Model Display */}
                <div className="bg-[#232438] border border-[#2d2e3e] rounded-xl p-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="bg-[#e74c8c] text-white text-xs px-2 py-0.5 rounded-full"
                        style={{ fontSize: '10px' }}
                      >
                        Unfiltered
                      </Badge>
                      <span className="text-white font-medium" style={{ fontSize: '12px' }}>
                        Free - Crushon Mochi - 🌹 Si...
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      5.1M
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-6 bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-orange-400"></div>
                      </div>
                      118.8s
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      3.40
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3 fill-pink-400" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      2.4K
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-xs mt-2" style={{ fontSize: '10px' }}>
                    An Explicit NSFW model with a focus on...
                  </p>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div>
              <div className="mb-4">
                <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                  Parameters
                </h3>
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
                <div className="bg-[#e74c8c] text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {temperature[0].toFixed(2)}
                </div>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mb-2"
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
                <div className="bg-[#e74c8c] text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {contentDiversity[0].toFixed(2)}
                </div>
                <Slider
                  value={contentDiversity}
                  onValueChange={setContentDiversity}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-400" style={{ fontSize: '11px' }}>
                  <span>Repetitive</span>
                  <span>Diverse</span>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div>
              <h3 className="text-[#e74c8c] font-semibold mb-4" style={{ fontSize: '14px' }}>
                General Settings
              </h3>

              {/* Max AI message length */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-medium" style={{ fontSize: '14px' }}>
                    Max AI message length
                  </h4>
                  <Badge className="bg-green-500 text-black text-xs px-2 py-0.5 rounded" style={{ fontSize: '10px' }}>
                    VIP
                  </Badge>
                </div>
                <p className="text-gray-400 mb-3" style={{ fontSize: '12px' }}>
                  The maximum amount of tokens that an AI will generate to respond. One word is approximately 3-4 tokens.
                </p>
                <div className="bg-[#e74c8c] text-white text-center px-3 py-1 rounded-lg mb-3 font-medium inline-block" style={{ fontSize: '12px' }}>
                  {maxMessageLength[0]}
                </div>
                <Slider
                  value={maxMessageLength}
                  onValueChange={setMaxMessageLength}
                  max={650}
                  min={225}
                  step={25}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs" style={{ fontSize: '11px' }}>
                  <span className="text-gray-400">225</span>
                  <div className="flex gap-2">
                    <Badge className="bg-green-500 text-black text-xs px-2 py-0.5 rounded" style={{ fontSize: '8px' }}>
                      Luxe
                    </Badge>
                    <span className="text-gray-400">450</span>
                    <Badge className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded" style={{ fontSize: '8px' }}>
                      Elite
                    </Badge>
                    <span className="text-gray-400">550</span>
                    <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded" style={{ fontSize: '8px' }}>
                      Imperial
                    </Badge>
                    <span className="text-gray-400">650</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
