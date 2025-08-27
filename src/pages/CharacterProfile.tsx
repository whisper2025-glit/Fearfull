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

  // Calculate tabs visibility - only show after scrolling starts (hide initially)
  const tabsOpacity = Math.min(Math.max(scrollY - 150, 0) / 200, 1);

  // Calculate when tabs should become sticky header
  const tabsStickyThreshold = 350; // Adjust this value based on when tabs should stick
  const shouldTabsBeSticky = scrollY >= tabsStickyThreshold;

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

      {/* Sticky Tabs Header - appears when tabs reach top */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${
          shouldTabsBeSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'rgba(17, 18, 22, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-white">{character.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="px-4 py-3 bg-[#111216]">
          <div className="flex gap-6">
            <button className="text-sm font-medium text-pink-400 border-b-2 border-pink-400 pb-2">
              Details
            </button>
            <button className="text-sm font-medium text-white/60 pb-2">
              Gallery (2)
            </button>
            <button className="text-sm font-medium text-white/60 pb-2">
              Comments (0)
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="relative z-30 h-full overflow-y-auto overscroll-none"
        onScroll={handleScroll}
        style={{
          paddingTop: 0,
          marginTop: 0,
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="h-[65vh]" style={{ minHeight: '65vh' }}></div>
        
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

          {/* Tabs - Hidden initially, revealed on scroll */}
          <Tabs
            defaultValue="details"
            className="w-full transition-opacity duration-300"
            style={{ opacity: tabsOpacity }}
          >
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

        {/* Extended bottom content area */}
        <div className="bg-[#111216] px-4 pb-8 space-y-6">
          {/* Additional character stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Character Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">59.6K</div>
                <div className="text-xs text-white/60">Messages</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">1008</div>
                <div className="text-xs text-white/60">Tokens</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-xs text-white/60">Rating</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">892</div>
                <div className="text-xs text-white/60">Likes</div>
              </div>
            </div>
          </div>

          {/* Related characters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">More by this Creator</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-2"></div>
                <h4 className="text-sm font-medium text-white truncate">Character 1</h4>
                <p className="text-xs text-white/60">Fantasy • Adventure</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="w-full aspect-square bg-gradient-to-br from-blue-600 to-green-600 rounded-lg mb-2"></div>
                <h4 className="text-sm font-medium text-white truncate">Character 2</h4>
                <p className="text-xs text-white/60">Sci-Fi • Romance</p>
              </div>
            </div>
          </div>

          {/* Creator info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">About Creator</h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full"></div>
                <div>
                  <h4 className="text-sm font-medium text-white">{character.users?.full_name || 'Unknown Creator'}</h4>
                  <p className="text-xs text-white/60">Character Creator</p>
                </div>
              </div>
              <p className="text-sm text-white/80">
                Passionate about creating immersive character experiences and storytelling.
                Specializes in fantasy and sci-fi characters with deep backgrounds.
              </p>
              <div className="flex gap-4 text-xs text-white/60">
                <span>12 Characters</span>
                <span>•</span>
                <span>2.4K Followers</span>
                <span>•</span>
                <span>Joined 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extra space to allow scrolling content to reach top navigation */}
        <div className="h-[100vh] bg-[#111216]"></div>
      </div>
    </div>
  );
}
