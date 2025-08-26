import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Settings, 
  ChevronRight,
  Heart,
  Share,
  ArrowLeft,
  Clock,
  Users,
  MessageCircle,
  Image as ImageIcon,
  Music,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Character {
  name: string;
  author: string;
  intro: string;
  scenario: string;
  avatar: string;
}

interface ChatSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  characterId: string;
  conversationId?: string | null;
}

const characterTags = [
  "Fantasy", "Furry", "Monster", "Mystery", "Non-Human", "OC"
];

const galleryImages = [
  "/placeholder.svg",
  "/placeholder.svg"
];

export function ChatSidebar({ 
  open, 
  onOpenChange, 
  character, 
  characterId, 
  conversationId 
}: ChatSidebarProps) {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate(`/chat/${characterId}`);
    onOpenChange(false);
  };

  const handleCharacterDetail = () => {
    console.log('Character detail clicked');
    onOpenChange(false);
  };

  const handleChatSettings = () => {
    console.log('Chat settings clicked');
    onOpenChange(false);
  };

  const menuItems = [
    {
      icon: FileText,
      label: "Character Detail"
    },
    {
      icon: Clock,
      label: "History"
    },
    {
      icon: Settings,
      label: "Chat Settings"
    },
    {
      icon: Users,
      label: "Persona"
    },
    {
      icon: MessageCircle,
      label: "Comments"
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[50vw] sm:w-[50vw] bg-gradient-to-b from-purple-900/95 via-purple-800/95 to-purple-900/95 border-none p-0 overflow-hidden backdrop-blur-sm"
      >
        <div className="flex flex-col h-full relative">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Header */}
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Character Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <Video className="h-2 w-2" />
                </Button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-white text-sm font-bold leading-tight mb-1">
                  {character.name}
                </h1>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <MessageCircle className="h-3 w-3" />
                  <span>55.8K</span>
                  <span>@{character.author}</span>
                </div>
              </div>
            </div>

            {/* Content Type Icons */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="h-4 w-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs px-2 py-1">
                AnyPOV
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {characterTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors text-xs px-2 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* New Chat Button */}
            <Button
              onClick={handleNewChat}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl py-3 mb-6 backdrop-blur-sm text-xs"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Menu Items */}
          <div className="relative z-10 flex-1 px-4 space-y-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                onClick={index === 0 ? handleCharacterDetail : index === 2 ? handleChatSettings : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-white/60" />
              </div>
            ))}
          </div>

          {/* Gallery Section */}
          <div className="relative z-10 p-4 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-sm font-medium">Gallery</h3>
                <span className="text-white/60 text-xs">• 2</span>
                <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">i</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20"
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
