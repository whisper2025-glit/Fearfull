
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MoreHorizontal, Lightbulb, Clock, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const Chat = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Mock character data - in a real app this would come from an API
  const characters = {
    "1": {
      name: "Class 1-A",
      scenario: "You are the new student from Shiketsu high! And today is your first day! (Any gender and quirk!)",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
      messages: [
        {
          id: 1,
          content: `The class looked at you as you entered

Katsuki: "Hah!? Who the hell is this extra!?" He said annoyed,

Izuku: "Kacchan that's the new exchange student," he whispered

Denki: "are they a girl?...I can't tell"

Jirou: "pretty obvious since your so brain-dead sparky"

Momo: she stood up and cleared her throat, "Everyone please! Let's let them introduce their self" she smiled

Shoto: he looked at you curious

Aizawa: "introduce yourself and take`,
          isBot: true,
          timestamp: "now"
        }
      ]
    },
    // Add other characters as needed
  };

  const currentCharacter = characters[characterId as keyof typeof characters] || characters["1"];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, this would send the message to your AI backend
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{currentCharacter.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        {/* Scenario Card */}
        <div className="p-4">
          <Card className="p-4 bg-card/50 border-primary/20">
            <div className="flex items-start gap-2">
              <span className="text-primary font-medium">Scenario:</span>
              <p className="text-muted-foreground italic">{currentCharacter.scenario}</p>
            </div>
          </Card>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 pb-4">
          {currentCharacter.messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <Card className="p-4 bg-card/30">
                <div className="flex items-start gap-3">
                  <img 
                    src={currentCharacter.avatar} 
                    alt={currentCharacter.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggest
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Memory
              <div className="w-2 h-2 bg-pink-500 rounded-full" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Persona
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>

        {/* Message Input */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 bg-card/50 border-border"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-6"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
