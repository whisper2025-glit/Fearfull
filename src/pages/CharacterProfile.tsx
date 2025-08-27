import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, MessageCircle, Heart, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Character {
  id: string;
  name: string;
  intro: string;
  scenario: string;
  avatar_url: string;
  users?: {
    full_name: string;
  };
}

export default function CharacterProfile() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return;

      try {
        const { data: characterData, error } = await supabase
          .from('characters')
          .select('*, users!characters_owner_id_fkey(full_name)')
          .eq('id', characterId)
          .single();

        if (error) {
          console.error('Error loading character:', error);
          toast.error('Character not found');
          navigate('/');
          return;
        }

        setCharacter(characterData);
      } catch (error) {
        console.error('Error loading character:', error);
        toast.error('Failed to load character');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, [characterId, navigate]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const handleStartChat = () => {
    navigate(`/chat/${characterId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111216] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#111216] text-white flex items-center justify-center">
        <div className="text-center">
          <p>Character not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Calculate header opacity based on scroll
  const contentStart = window.innerHeight * 0.65;
  const headerActivationPoint = contentStart - 100;
  const headerOpacity = Math.min(Math.max(scrollY - headerActivationPoint, 0) / 150, 1);
  const titleOpacity = Math.min(Math.max(scrollY - headerActivationPoint - 50, 0) / 100, 1);

  return (
    <div className="fixed inset-0 bg-[#111216] text-white overflow-hidden">
      {/* Character Image Background - Fixed */}
      <div className="absolute inset-0 z-0">
        <img
          src={character.avatar_url || "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"}
          alt="Character"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/60 to-transparent" />
      </div>

      {/* Scrollable Header - appears on scroll */}
      <div
        className="absolute top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(17, 18, 22, ${headerOpacity})`,
          backdropFilter: headerOpacity > 0.5 ? 'blur(10px)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white"
              onClick={handleBack}
              style={{
                backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2
              className="text-lg font-semibold text-white transition-opacity duration-300"
              style={{ opacity: titleOpacity }}
            >
              {character.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white"
              onClick={handleShare}
              style={{
                backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white"
              style={{
                backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Initial Top Navigation - visible when not scrolled */}
      <div
        className="absolute top-3 left-4 right-4 flex items-center justify-between z-20 transition-opacity duration-300"
        style={{ opacity: 1 - headerOpacity }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white bg-black/20 backdrop-blur-sm"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white bg-black/20 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white bg-black/20 backdrop-blur-sm"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="relative z-10 h-full overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="h-[65vh]"></div>
        
        {/* Character Info Section */}
        <div className="bg-[#111216] p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{character.name}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
              <span>@{character.users?.full_name || 'Unknown'}</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>59.6K</span>
              </div>
              <span>1008 tokens</span>
            </div>
          </div>
          
          {/* Start Chat Button */}
          <div className="w-full">
            <div className="w-full rounded-full p-[1px] bg-gradient-to-r from-pink-500 to-cyan-400">
              <Button 
                className="w-full rounded-full bg-black/40 hover:bg-black/60 text-white text-base py-3"
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-transparent p-0 h-auto w-full justify-start">
              <TabsTrigger 
                value="details" 
                className="text-white data-[state=active]:text-pink-400 data-[state=active]:bg-transparent bg-transparent border-b-2 border-transparent data-[state=active]:border-pink-400 rounded-none px-0 mr-6"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="text-white/60 data-[state=active]:text-pink-400 data-[state=active]:bg-transparent bg-transparent border-b-2 border-transparent data-[state=active]:border-pink-400 rounded-none px-0 mr-6"
              >
                Gallery (2)
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                className="text-white/60 data-[state=active]:text-pink-400 data-[state=active]:bg-transparent bg-transparent border-b-2 border-transparent data-[state=active]:border-pink-400 rounded-none px-0"
              >
                Comments (0)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {['🎭', '📷', '🎵', 'AnyPOV', 'Fantasy', 'Furry', 'Monster', 'Mystery', 'Non-Human', 'OC', 'Sci-Fi'].map((tag, index) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={`${index < 3 ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-white/10 text-white/70 border-white/20'} text-xs px-2 py-1 rounded-full`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Audio */}
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Final Fantasy VII - Woozy Spec...</div>
                  <div className="text-xs text-white/60 flex items-center gap-2">
                    <span className="w-16 h-1 bg-gradient-to-r from-pink-500 to-transparent rounded"></span>
                    <span>SOUNDCLOUD</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-white font-semibold">[Cute, Alien, Oblivious]</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {character.intro}
                </p>
                {character.scenario && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Scenario:</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {character.scenario}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-4">
              <div className="text-center text-white/60 py-8">
                Gallery content would go here
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-4">
              <div className="text-center text-white/60 py-8">
                No comments yet
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
