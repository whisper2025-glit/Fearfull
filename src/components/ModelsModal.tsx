import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronRight, Star, Circle, X, ChevronDown } from "lucide-react";

interface Model {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  responseTime: string;
  memory: string;
  rating: number;
  tags: string[];
  isActive?: boolean;
  isPremium?: boolean;
  tier: 'standard' | 'pro' | 'max';
}

interface ModelFolder {
  id: string;
  name: string;
  modelCount: number;
}

interface ModelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModelSelect: (model: Model) => void;
  selectedModel?: Model;
}

const mockModels: Model[] = [];

const mockFolders: ModelFolder[] = [
  { id: "1", name: "JuicyLLM", modelCount: 15 },
  { id: "2", name: "Community", modelCount: 234 },
  { id: "3", name: "Official", modelCount: 12 },
  { id: "4", name: "NSFW", modelCount: 89 },
  { id: "5", name: "SFW", modelCount: 156 },
  { id: "6", name: "Roleplay", modelCount: 67 },
];

export function ModelsModal({ open, onOpenChange, onModelSelect, selectedModel }: ModelsModalProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'pro' | 'max'>('standard');
  const [view, setView] = useState<'main' | 'allModels'>('main');
  const [allModelsTab, setAllModelsTab] = useState<'all' | 'collections' | 'recently'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('active');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredModels = mockModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = model.tier === activeTab;
    return matchesSearch && matchesTier;
  });

  const handleModelSelect = (model: Model) => {
    onModelSelect(model);
    onOpenChange(false);
  };

  const handleFolderSelect = (folder: ModelFolder) => {
    setSelectedFolder(folder.id);
    setView('main');
  };

  const renderModelCard = (model: Model) => (
    <Card
      key={model.id}
      className={`border transition-all cursor-pointer rounded-xl overflow-hidden ${
        selectedModel?.id === model.id ? 'border-[#e74c8c]' : 'border-[#2d2e3e]'
      } ${model.isActive ? 'border-[#e74c8c] bg-gradient-to-br from-[#e74c8c]/10 to-[#c44f93]/5' : 'bg-[#232438]'} hover:border-[#e74c8c]/60`}
      onClick={() => handleModelSelect(model)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Circle className={`h-2.5 w-2.5 flex-shrink-0 ${model.isActive ? 'fill-[#e74c8c] text-[#e74c8c]' : 'text-gray-500'}`} />
            <h3 className="text-xs font-semibold text-white truncate" style={{ fontSize: '12px' }}>{model.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-sm font-bold text-green-400">${model.price}</div>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white">
              <Star className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-[#e74c8c] text-xs" style={{ fontSize: '11px' }}>{model.author}</p>
          <div className="flex gap-1">
            {model.tags.slice(0, 1).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`text-xs px-1.5 py-0 rounded ${
                  tag === 'NSFW' ? 'bg-[#e74c8c] text-white' :
                  tag.includes('%OFF') ? 'bg-[#ffa500] text-black' :
                  'bg-gray-600 text-white'
                }`}
                style={{ fontSize: '9px' }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-green-400 text-green-400" />
              <span style={{ fontSize: '10px' }}>{model.responseTime}</span>
            </span>
            {model.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span style={{ fontSize: '10px' }}>{model.rating}k</span>
              </span>
            )}
          </div>
          <Badge variant="secondary" className="text-xs bg-[#ffa500] text-black" style={{ fontSize: '8px' }}>
            FREE
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center">
              <DialogTitle className="text-lg font-bold text-[#e74c8c]" style={{ fontSize: '18px' }}>
                Change Model
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Tier Tabs */}
            <div className="flex gap-1 mb-3 flex-shrink-0">
            <Button
              variant={activeTab === 'standard' ? 'default' : 'ghost'}
              className={`flex-1 rounded-2xl text-xs font-medium py-2 border-0 ${
                activeTab === 'standard'
                  ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                  : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
              }`}
              style={{ fontSize: '12px' }}
              onClick={() => setActiveTab('standard')}
            >
              Standard
            </Button>
            <Button
              variant={activeTab === 'pro' ? 'default' : 'ghost'}
              className={`flex-1 rounded-2xl text-xs font-medium py-2 border-0 ${
                activeTab === 'pro'
                  ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                  : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
              }`}
              style={{ fontSize: '12px' }}
              onClick={() => setActiveTab('pro')}
            >
              Pro ♦ Member
            </Button>
            <Button
              variant={activeTab === 'max' ? 'default' : 'ghost'}
              className={`flex-1 rounded-2xl text-xs font-medium py-2 border-0 ${
                activeTab === 'max'
                  ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                  : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
              }`}
              style={{ fontSize: '12px' }}
              onClick={() => setActiveTab('max')}
            >
              Max ♦ Diamond
            </Button>
          </div>

          {view === 'main' ? (
            <>
              {/* Controls */}
              <div className="flex gap-2 mb-3 flex-shrink-0">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 bg-[#2d2e3e] border-[#3d3e4e] text-white hover:bg-[#34354a] rounded-lg px-3 py-2"
                  style={{ fontSize: '12px' }}
                  onClick={() => setView('allModels')}
                >
                  {selectedFolder ? mockFolders.find(f => f.id === selectedFolder)?.name || 'All Models' : 'All Models'}
                  <ChevronRight className="h-3 w-3" />
                </Button>

                <div className="relative">
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 bg-[#1a1b2e] border-[#3d3e4e] text-white hover:bg-[#2d2e3e] rounded-lg px-3 py-2"
                    style={{ fontSize: '12px' }}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {filterType === 'active' ? 'Active' : filterType === 'new' ? 'New' : 'Popular'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-[#e74c8c] border border-[#c44f93] rounded-lg shadow-lg z-50 min-w-[120px]">
                      <div className="p-1">
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#d63384] rounded text-white font-medium"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setFilterType('active');
                            setShowDropdown(false);
                          }}
                        >
                          Active
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#d63384] rounded text-white"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setFilterType('new');
                            setShowDropdown(false);
                          }}
                        >
                          New
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#d63384] rounded text-white"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setFilterType('popular');
                            setShowDropdown(false);
                          }}
                        >
                          Popular
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="icon" className="text-white hover:bg-[#2d2e3e] rounded-lg">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Currently Using */}
              <div className="mb-3 flex-shrink-0">
                <div className="flex items-center justify-end mb-2">
                  <span className="text-xs text-gray-400" style={{ fontSize: '12px' }}>Using</span>
                </div>
              </div>

              {/* Models List */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1 max-h-full">
                {filteredModels.map(renderModelCard)}
              </div>
            </>
          ) : (
            <>
              {/* All Models View */}
              <div className="mb-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <Button
                      variant={allModelsTab === 'all' ? 'default' : 'ghost'}
                      className={`text-xs rounded-lg px-3 py-2 ${
                        allModelsTab === 'all'
                          ? 'bg-[#e74c8c]/20 border border-[#e74c8c] text-[#e74c8c]'
                          : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                      }`}
                      style={{ fontSize: '12px' }}
                      onClick={() => setAllModelsTab('all')}
                    >
                      All Models
                    </Button>
                    <Button
                      variant={allModelsTab === 'collections' ? 'default' : 'ghost'}
                      className={`text-xs rounded-lg px-3 py-2 ${
                        allModelsTab === 'collections'
                          ? 'bg-[#e74c8c]/20 border border-[#e74c8c] text-[#e74c8c]'
                          : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                      }`}
                      style={{ fontSize: '12px' }}
                      onClick={() => setAllModelsTab('collections')}
                    >
                      Collections
                    </Button>
                    <Button
                      variant={allModelsTab === 'recently' ? 'default' : 'ghost'}
                      className={`text-xs rounded-lg px-3 py-2 ${
                        allModelsTab === 'recently'
                          ? 'bg-[#e74c8c]/20 border border-[#e74c8c] text-[#e74c8c]'
                          : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a]'
                      }`}
                      style={{ fontSize: '12px' }}
                      onClick={() => setAllModelsTab('recently')}
                    >
                      Recently
                    </Button>
                  </div>
                </div>

                {/* Folders List */}
                <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1 max-h-full">
                  {mockFolders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="bg-[#232438] border border-[#2d2e3e] hover:border-[#e74c8c]/40 cursor-pointer transition-all rounded-xl"
                      onClick={() => handleFolderSelect(folder)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-white" style={{ fontSize: '14px' }}>{folder.name}</h3>
                            <p className="text-xs text-gray-400" style={{ fontSize: '12px' }}>
                              {folder.modelCount} models
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#2d2e3e] flex-shrink-0">
            {selectedModel && (
              <div className="bg-[#1a4d5c] p-2 rounded-lg mb-2">
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontSize: '11px' }}>Selected Model:</p>
                <p className="text-sm font-medium text-white" style={{ fontSize: '12px' }}>{selectedModel.name}</p>
              </div>
            )}

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
                onClick={() => onOpenChange(false)}
                disabled={!selectedModel}
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
