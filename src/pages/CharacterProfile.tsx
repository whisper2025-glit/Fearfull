import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, MessageCircle, Heart, ChevronLeft } from "lucide-react";
import { supabase, favoriteCharacter, checkIsFavorited } from "@/lib/supabase";
import { getFollowersCount } from "@/lib/follow";
import { toast } from "sonner";
import { FullscreenSpinner } from "@/components/ui/loading-spinner";
import { CommentsList } from "@/components/CommentsList";
import { useComments } from "@/hooks/useComments";
import { trackEvent } from "@/lib/analytics";

interface Character {
  id: string;
  name: string;
  intro: string;
  scenario: string;
  avatar_url: string;
  visibility: 'public' | 'unlisted' | 'private';
  owner_id?: string;
  tags?: string[] | null;
  personality?: string | null;
  appearance?: string | null;
  greeting?: string | null;
  rating?: 'filtered' | 'unfiltered';
  users?: {
    id: string;
    full_name: string;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
  };
}

interface UserStats {
  charactersCount: number;
  followersCount: number;
  likesCount: number;
}

export default function CharacterProfile() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [character, setCharacter] = useState<Character | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ charactersCount: 0, followersCount: 0, likesCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Use the comments hook for real-time data
  const {
    comments,
    isLoading: commentsLoading,
    handleAddComment,
    handleLikeComment,
    handleReplyToComment
  } = useComments(characterId || '');

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return;

      try {
        // Fetch character with complete user data
        const { data: characterData, error } = await supabase
          .from('characters')
          .select(`
            *,
            users!characters_owner_id_fkey(
              id,
              full_name,
              username,
              bio,
              avatar_url,
              banner_url
            )
          `)
          .eq('id', characterId)
          .single();

        if (error) {
          console.error('Error loading character:', error);
          toast.error('Character not found');
          navigate('/');
          return;
        }

        // Guard: block private characters for non-owners
        if (characterData.visibility === 'private' && user?.id !== characterData.owner_id) {
          toast.error('This character is private');
          navigate('/');
          return;
        }

        setCharacter(characterData);

        // Set document title and OG meta
        document.title = `${characterData.name} • WhisperChat`;
        const setMeta = (property: string, content: string) => {
          let el = document.querySelector(`meta[property=\"${property}\"]`) as HTMLMetaElement | null;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        setMeta('og:title', characterData.name);
        setMeta('og:description', characterData.intro || 'Chat with this character on WhisperChat');
        setMeta('og:image', characterData.avatar_url || `${window.location.origin}/placeholder.svg`);
        setMeta('og:type', 'website');
        setMeta('og:url', window.location.href);

        // Add meta noindex for unlisted/private
        if (characterData.visibility !== 'public') {
          const meta = document.createElement('meta');
          meta.name = 'robots';
          meta.content = 'noindex, nofollow';
          document.head.appendChild(meta);
          const cleanup = () => {
            try { document.head.removeChild(meta); } catch {}
          };
          (window as any).__unlisted_meta_cleanup__ = cleanup;
        } else if ((window as any).__unlisted_meta_cleanup__) {
          (window as any).__unlisted_meta_cleanup__();
          (window as any).__unlisted_meta_cleanup__ = null;
        }

        // Fetch user stats if we have the owner ID
        if (characterData.owner_id) {
          await loadUserStats(characterData.owner_id);
        }

        // Check if current user has favorited this character
        if (user && characterId) {
          const favoritedIds = await checkIsFavorited(user.id, [characterId]);
          setIsFavorited(favoritedIds.includes(characterId));
        }
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

  const loadUserStats = async (userId: string) => {
    try {
      // Get user's character count
      const { data: userCharacters, error: charactersError } = await supabase
        .from('characters')
        .select('id')
        .eq('owner_id', userId)
        .eq('visibility', 'public');

      if (charactersError) {
        console.error('Error loading user characters:', charactersError);
      }

      // Get user's total likes count on their characters
      const { data: likesData, error: likesError } = await supabase
        .from('comments')
        .select('likes_count')
        .in('character_id', (userCharacters || []).map(char => char.id));

      if (likesError) {
        console.error('Error loading likes count:', likesError);
      }

      const totalLikes = (likesData || []).reduce((sum, comment) => sum + (comment.likes_count || 0), 0);

      // Followers count from DB if available (fallback to 0)
      let followersCount = 0;
      try {
        followersCount = await getFollowersCount(userId);
      } catch (e) {
        console.warn('Followers count unavailable:', e);
      }

      setUserStats({
        charactersCount: userCharacters?.length || 0,
        followersCount,
        likesCount: totalLikes
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default stats on error
      setUserStats({ charactersCount: 0, followersCount: 0, likesCount: 0 });
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Please sign in to favorite characters');
      return;
    }

    if (!characterId || isFavoriteLoading) return;

    setIsFavoriteLoading(true);
    try {
      const newFavoriteStatus = await favoriteCharacter(user.id, characterId);
      setIsFavorited(newFavoriteStatus);
      trackEvent('favorite_toggle', { character_id: characterId, is_favorited: newFavoriteStatus });
      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error favoriting character:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const handleStartChat = () => {
    trackEvent('start_chat', { character_id: characterId });
    navigate(`/chat/${characterId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    trackEvent('character_share', { character_id: characterId, visibility: character?.visibility });
    toast.success('Profile link copied to clipboard');
  };

  if (isLoading) {
    return <FullscreenSpinner label="Loading character..." />;
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
          src={character.avatar_url || "/placeholder.svg"}
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
              className={`h-10 w-10 transition-colors ${
                isFavorited ? 'text-cyan-400' : 'text-white'
              } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
              style={{
                backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              <Heart className={`h-5 w-5 ${
                isFavorited ? 'fill-cyan-400' : ''
              }`} />
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
            className={`h-10 w-10 bg-black/20 backdrop-blur-sm transition-colors ${
              isFavorited ? 'text-cyan-400' : 'text-white'
            } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleFavoriteClick}
            disabled={isFavoriteLoading}
          >
            <Heart className={`h-5 w-5 ${
              isFavorited ? 'fill-cyan-400' : ''
            }`} />
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{character.name}</h2>
              {character.visibility && character.visibility !== 'public' && (
                <Badge variant="secondary" className="text-xs">
                  {character.visibility === 'private' ? 'Private' : 'Unlisted'}
                </Badge>
              )}
            </div>
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
              className={`h-8 w-8 transition-colors ${
                isFavorited ? 'text-cyan-400' : 'text-white'
              } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
            >
              <Heart className={`h-4 w-4 ${
                isFavorited ? 'fill-cyan-400' : ''
              }`} />
            </Button>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="px-4 py-3 bg-[#111216]">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'details' ? 'text-cyan-400 border-cyan-400' : 'text-white/60 border-transparent'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'comments' ? 'text-cyan-400 border-cyan-400' : 'text-white/60 border-transparent'
              }`}
            >
              Comments ({comments.length})
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
          className="bg-black/[0.025] backdrop-blur-sm p-2 space-y-1.5 rounded-t-xl will-change-transform"
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
              <span>@{character.users?.full_name || character.users?.username || 'Unknown'}</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{comments.length}</span>
              </div>
              <span>{(character.intro?.length || 0) + (character.scenario?.length || 0) + (character.personality?.length || 0)} tokens</span>
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
            <div className="w-full rounded-full p-[1px] bg-gradient-to-r from-gray-500 to-cyan-400">
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
              <button
                onClick={() => setActiveTab('details')}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'text-cyan-400 border-cyan-400' : 'text-white/60 border-transparent'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === 'comments' ? 'text-cyan-400 border-cyan-400' : 'text-white/60 border-transparent'
                }`}
              >
                Comments ({comments.length})
              </button>
            </div>
          </div>

          {/* Content Section - Conditional based on activeTab */}
          <div className={`${activeTab === 'comments' ? '' : 'space-y-4'} ${shouldTabsBeSticky ? 'mt-0 pt-4' : 'mt-4'}`}>
            {activeTab === 'details' && (
              <>
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
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
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
                    className="text-cyan-400 text-sm font-medium flex items-center gap-1 mt-3 hover:text-cyan-300 transition-colors"
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

              {/* Creation Info Block */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-4 border border-white/10 mt-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Creation Info</h3>
                  <button
                    className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center gap-1"
                    onClick={() => navigate(`/creator/${character.owner_id}`)}
                  >
                    View Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Creator Profile */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {character.users?.avatar_url ? (
                      <img
                        src={character.users.avatar_url}
                        alt={character.users.full_name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {character.users?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {character.users?.full_name || 'Unknown Creator'}
                      </h4>
                      {/* Creator Stats */}
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-white">{userStats.followersCount}</span>
                          <span className="text-xs text-white/60">Followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-cyan-400" />
                          <span className="text-sm font-medium text-white">{userStats.likesCount}</span>
                          <span className="text-xs text-white/60">Likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white">{userStats.charactersCount}</span>
                    <span className="text-xs text-white/60">Bots</span>
                  </div>
                </div>

                {/* Bio */}
                {character.users?.bio && (
                  <div className="text-sm text-white/80 leading-relaxed">
                    <p>{character.users.bio}</p>
                  </div>
                )}
              </div>
              </>
            )}

            {activeTab === 'comments' && (
              <div className="w-full h-full -mx-2 -my-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <CommentsList
                  comments={comments}
                  isLoading={commentsLoading}
                  characterId={characterId}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onReplyToComment={handleReplyToComment}
                />
              </div>
            )}
          </div>
        </div>


        {/* Small padding at bottom */}
        <div className="h-20 bg-[#111216]"></div>
      </div>
    </div>
  );
}
