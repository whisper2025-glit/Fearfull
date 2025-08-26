import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Settings, 
  ChevronRight,
  Users,
  MessageCircle
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

export function ChatSidebar({ 
  open, 
  onOpenChange, 
  character, 
  characterId, 
  conversationId 
}: ChatSidebarProps) {
  const navigate = useNavigate();

  const handleNewChat = () => {
    // Navigate to a new chat with the same character (without conversation ID)
    navigate(`/chat/${characterId}`);
    onOpenChange(false);
  };

  const handleCharacterDetail = () => {
    // Navigate to character detail page (you can implement this route later)
    console.log('Character detail clicked');
    onOpenChange(false);
  };

  const handleChatSettings = () => {
    // Open chat settings (you can implement this modal later)
    console.log('Chat settings clicked');
    onOpenChange(false);
  };

  const menuItems = [
    {
      icon: Plus,
      label: "New Chat",
      onClick: handleNewChat,
      description: "Start a fresh conversation"
    },
    {
      icon: FileText,
      label: "Character Detail",
      onClick: handleCharacterDetail,
      description: "View character information"
    },
    {
      icon: Settings,
      label: "Chat Settings",
      onClick: handleChatSettings,
      description: "Configure chat preferences"
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[350px] sm:w-[400px] bg-[#1a1b2e] border-[#2d2e3e] p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header with Character Info */}
          <div className="relative p-6 border-b border-[#2d2e3e]">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e74c8c]/10 to-[#c44f93]/5" />
            
            <div className="relative z-10">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-[#e74c8c]/30">
                    <AvatarImage src={character.avatar} alt={character.name} />
                    <AvatarFallback className="bg-[#232438] text-white text-lg">
                      {character.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-white text-lg font-bold truncate">
                      {character.name}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-400 truncate">
                        by {character.author}
                      </span>
                    </div>
                    {conversationId && (
                      <Badge variant="secondary" className="mt-2 bg-[#e74c8c]/20 text-[#e74c8c] border-[#e74c8c]/30">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Active Chat
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-3">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className="bg-[#232438] border-[#2d2e3e] hover:border-[#e74c8c]/40 cursor-pointer transition-all duration-200 hover:bg-[#2a2b42]"
                onClick={item.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#e74c8c]/10 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-[#e74c8c]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{item.label}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#2d2e3e]">
            <Button
              variant="outline"
              className="w-full bg-[#2d2e3e] border-[#3d3e4e] text-white hover:bg-[#34354a]"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
