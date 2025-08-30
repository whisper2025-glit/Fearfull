import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bug, ChevronDown, ChevronRight, Activity, Settings, Zap } from "lucide-react";
import { Model } from "@/components/ModelsModal";
import { ChatSettings } from "@/lib/supabase";

interface DebugMenuProps {
  selectedModel?: Model | null;
  currentChatSettings?: ChatSettings | null;
  lastAPICall?: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    timestamp: string;
  } | null;
}

export function DebugMenu({ selectedModel, currentChatSettings, lastAPICall }: DebugMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (value: number, type: 'temperature' | 'tokens' | 'diversity') => {
    switch (type) {
      case 'temperature':
        if (value < 0.3) return 'bg-cyan-500';
        if (value < 0.7) return 'bg-green-500';
        return 'bg-orange-500';
      case 'tokens':
        if (value < 300) return 'bg-yellow-500';
        if (value < 500) return 'bg-green-500';
        return 'bg-cyan-500';
      case 'diversity':
        if (value < 0.3) return 'bg-red-500';
        if (value < 0.7) return 'bg-green-500';
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#1a1b2e] border-[#2d2e3e] text-white hover:bg-[#232438] gap-2 shadow-lg"
          >
            <Bug className="h-4 w-4" />
            Debug
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-[#1a1b2e] border-[#2d2e3e] text-white shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Chat Settings Debug
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-sm">
              {/* Current Model */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  Selected Model
                </h4>
                <div className="bg-[#232438] rounded-lg p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-xs truncate max-w-[150px]" title={selectedModel?.name}>
                      {selectedModel?.name || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provider:</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedModel?.provider || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory:</span>
                    <span>{selectedModel?.memory || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Current Settings */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Applied Settings
                </h4>
                <div className="bg-[#232438] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Temperature:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(currentChatSettings?.temperature || 0.7, 'temperature')}`}
                      />
                      <span className="font-mono">
                        {currentChatSettings?.temperature?.toFixed(2) || '0.70'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Content Diversity:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(currentChatSettings?.content_diversity || 0.05, 'diversity')}`}
                      />
                      <span className="font-mono">
                        {currentChatSettings?.content_diversity?.toFixed(2) || '0.05'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Tokens:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(currentChatSettings?.max_tokens || 195, 'tokens')}`}
                      />
                      <span className="font-mono">
                        {currentChatSettings?.max_tokens || '195'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last API Call */}
              {lastAPICall && (
                <div>
                  <h4 className="font-medium text-cyan-400 mb-2">Last API Call</h4>
                  <div className="bg-[#232438] rounded-lg p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className="font-mono">{lastAPICall.temperature.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Top P:</span>
                      <span className="font-mono">{lastAPICall.top_p.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Tokens:</span>
                      <span className="font-mono">{lastAPICall.max_tokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-xs">{formatTimestamp(lastAPICall.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Status */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-2">Status</h4>
                <div className="bg-[#232438] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentChatSettings ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs">
                      {currentChatSettings ? 'Settings Loaded' : 'Using Defaults'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${selectedModel ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs">
                      {selectedModel ? 'Model Selected' : 'No Model'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${lastAPICall ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-xs">
                      {lastAPICall ? 'API Called' : 'No API Calls Yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="text-xs text-gray-400 border-t border-[#2d2e3e] pt-2">
                <p>💡 <strong>Temperature:</strong> Higher = more creative</p>
                <p>🎯 <strong>Diversity:</strong> Higher = more varied responses</p>
                <p>📏 <strong>Max Tokens:</strong> Response length limit (195-650)</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
