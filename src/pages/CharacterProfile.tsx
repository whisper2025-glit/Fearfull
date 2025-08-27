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
  tags?: string[] | null;
  personality?: string | null;
  appearance?: string | null;
  greeting?: string | null;
  rating?: 'filtered' | 'unfiltered';
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Smooth easing function for better animations
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Calculate header opacity based on scroll with smooth easing
  const contentStart = window.innerHeight * 0.745;
  const headerActivationPoint = contentStart - 100;
  const rawHeaderProgress = Math.min(Math.max(scrollY - headerActivationPoint, 0) / 150, 1);
  const headerOpacity = easeOutCubic(rawHeaderProgress);
  const titleOpacity = easeOutCubic(Math.min(Math.max(scrollY - headerActivationPoint - 30, 0) / 80, 1));

  // Calculate tabs visibility with smooth transitions
  const rawTabsProgress = Math.min(Math.max(scrollY - 120, 0) / 180, 1);
  const tabsOpacity = easeInOutCubic(rawTabsProgress);

  // Calculate when tabs should become sticky header with smoother transition zone
  const tabsStickyThreshold = 420;
  const stickyTransitionZone = 60;
  const shouldTabsBeSticky = scrollY >= tabsStickyThreshold;
  const stickyProgress = Math.min(Math.max(scrollY - tabsStickyThreshold, 0) / stickyTransitionZone, 1);
  const stickyOpacity = easeInOutCubic(stickyProgress);

  // Content hiding progress for smooth fade out
  const contentHideProgress = easeInOutCubic(Math.min(Math.max(scrollY - (tabsStickyThreshold - 100), 0) / 120, 1));

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
        className="absolute top-0 left-0 right-0 z-50 will-change-transform"
        style={{
          backgroundColor: `rgba(17, 18, 22, ${headerOpacity * (1 - stickyProgress)})`,
          backdropFilter: headerOpacity > 0.3 ? `blur(${Math.min(headerOpacity * 15, 15)}px)` : 'none',
          opacity: 1 - stickyProgress,
          transform: `translateY(${stickyProgress * -10}px)`,
          pointerEvents: stickyProgress > 0.8 ? 'none' : 'auto',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
        className="absolute top-3 left-4 right-4 flex items-center justify-between z-20 will-change-transform"
        style={{
          opacity: 1 - headerOpacity,
          transform: `translateY(${headerOpacity * -5}px) scale(${1 - headerOpacity * 0.05})`,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
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
        className="fixed top-0 left-0 right-0 z-40 will-change-transform"
        style={{
          backgroundColor: `rgba(17, 18, 22, ${0.95 * stickyOpacity})`,
          backdropFilter: stickyOpacity > 0.3 ? `blur(${Math.min(stickyOpacity * 15, 15)}px)` : 'none',
          opacity: stickyOpacity,
          transform: `translateY(${(1 - stickyOpacity) * -20}px)`,
          pointerEvents: stickyOpacity > 0.3 ? 'auto' : 'none',
          transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
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
        <div className="h-[74.5vh]" style={{ minHeight: '74.5vh' }}></div>
        
        {/* Character Info Section */}
        <div
          className="bg-[#111216] p-2 space-y-1.5 rounded-t-xl will-change-transform"
          style={{
            paddingTop: shouldTabsBeSticky ? `${120 + (stickyOpacity * 20)}px` : '16px',
            transition: 'padding-top 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          <div
            className="will-change-transform"
            style={{
              opacity: 1 - contentHideProgress,
              transform: `translateY(${contentHideProgress * 15}px)`,
              transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              pointerEvents: contentHideProgress > 0.7 ? 'none' : 'auto'
            }}
          >
            <h1 className="text-base font-bold text-white leading-tight">{character.name}</h1>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span>@{character.users?.full_name || 'Unknown'}</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>59.6K</span>
              </div>
              <span>1008 tokens</span>
            </div>
          </div>
          
          {/* Start Chat Button */}
          <div
            className="w-full will-change-transform"
            style={{
              opacity: 1 - contentHideProgress,
              transform: `translateY(${contentHideProgress * 10}px) scale(${1 - contentHideProgress * 0.02})`,
              transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              pointerEvents: contentHideProgress > 0.7 ? 'none' : 'auto'
            }}
          >
            <div className="w-full rounded-full p-[1px] bg-gradient-to-r from-pink-500 to-cyan-400">
              <Button
                className="w-full rounded-full bg-black/40 hover:bg-black/60 text-white text-sm py-1"
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            </div>
          </div>

          {/* Tab Navigation - Hidden initially, revealed on scroll, hidden when sticky header is active */}
          <div
            className="w-full will-change-transform"
            style={{
              opacity: (1 - contentHideProgress) * tabsOpacity,
              transform: `translateY(${contentHideProgress * 8}px)`,
              transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              pointerEvents: contentHideProgress > 0.5 ? 'none' : 'auto'
            }}
          >
            <div className="flex gap-6 border-b border-white/10 pb-3">
              <button className="text-sm font-medium text-pink-400 border-b-2 border-pink-400 pb-2">
                Details
              </button>
              <button className="text-sm font-medium text-white/60 pb-2">
                Comments (0)
              </button>
            </div>
          </div>

          {/* Content Section - Always visible */}
          <div className={`space-y-4 ${shouldTabsBeSticky ? 'mt-0 pt-4' : 'mt-4'}`}>
              {/* Introduction Block - Hidden initially, shown when scrolled */}
              <div
                className="bg-[#1a1a1a] rounded-lg p-4 space-y-4 border border-white/10 transition-all duration-300"
                style={{
                  opacity: tabsOpacity,
                  transform: `translateY(${(1 - tabsOpacity) * 20}px)`,
                  pointerEvents: tabsOpacity > 0.3 ? 'auto' : 'none'
                }}
              >
                <h3 className="text-lg font-semibold text-white">Introduction</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {character.tags && character.tags.length > 0 ? (
                    character.tags.map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`${
                          index === 0 || tag.toLowerCase() === 'unfiltered'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-gray-600/50 text-gray-300 border-gray-500/30'
                        } text-xs px-3 py-1 rounded-full border`}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    // Default tags if none in database
                    ['AnyPOV', 'Fantasy', 'OC'].map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-gray-600/50 text-gray-300 border-gray-500/30 text-xs px-3 py-1 rounded-full border"
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>

                {/* Character Traits */}
                {(character.personality || character.appearance) && (
                  <div className="text-white/90 text-sm font-medium">
                    [{[character.personality, character.appearance].filter(Boolean).join(' | ')}]
                  </div>
                )}

                {/* Introduction Text */}
                <div className="space-y-3">
                  <div className={`text-white/80 text-sm leading-relaxed transition-all duration-300 ${
                    isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'
                  }`}>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {character.intro}
                    </p>

                    {character.scenario && isExpanded && (
                      <div className="mt-4">
                        <p className="text-white/70 text-sm leading-relaxed">
                          {character.scenario}
                        </p>
                      </div>
                    )}

                    {character.appearance && isExpanded && (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-2">Appearance:</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {character.appearance}
                        </p>
                      </div>
                    )}

                    {character.greeting && isExpanded && (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-2">Greeting:</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {character.greeting}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* View More/Less Button */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-pink-400 text-sm font-medium flex items-center gap-1 mt-3 hover:text-pink-300 transition-colors"
                  >
                    {isExpanded ? 'View Less' : 'View More'}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>

          {/* Comments Section - Hidden by default, can be shown later */}
          <div className="hidden">
            <div className="text-center text-white/60 py-8">
              No comments yet
            </div>
          </div>
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

          {/* Creation Info Block */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-4 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Creation Info</h3>
              <button className="text-pink-400 text-sm font-medium hover:text-pink-300 transition-colors flex items-center gap-1">
                View Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Creator Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {character.users?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {character.users?.full_name || 'Unknown Creator'}
                  </h4>
                </div>
              </div>
              <button className="bg-gray-600/50 text-white text-sm px-4 py-2 rounded-full hover:bg-gray-600/70 transition-colors">
                Following
              </button>
            </div>

            {/* Badges Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎲</span>
                </div>
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎯</span>
                </div>
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎪</span>
                </div>
              </div>
              <button className="bg-gray-700/50 text-white text-sm px-3 py-1 rounded-full hover:bg-gray-700/70 transition-colors flex items-center gap-1">
                All Badges
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">86.2K</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-semibold">284.3M</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm text-white/80 leading-relaxed">
              <p>
                ----&gt; https://linktr.ee/BPAtis &lt;----- Formerly Burrito Princess. Hello nerds💖 One and only bot creator of ...
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </button>
              <button className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
            </div>

            {/* Creator's Other Characters */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="relative">
                  <div className="w-full aspect-square bg-gradient-to-br from-red-500 to-pink-500 rounded-lg"></div>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded text-xs text-white px-1 py-0.5 truncate">
                    Atis - Br...
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded text-xs text-white px-1 py-0.5 truncate">
                    Princess...
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"></div>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded text-xs text-white px-1 py-0.5 truncate">
                    Alice
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-600 to-black rounded-lg"></div>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded text-xs text-white px-1 py-0.5 truncate">
                    Opelia
                  </div>
                </div>
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
