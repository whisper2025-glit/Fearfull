import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, MoreHorizontal, Star, Loader2 } from "lucide-react";
import { CharacterCard } from "@/components/CharacterCard";
import { AdventureCard } from "@/components/AdventureCard";
import { supabase, getFavoriteCharacters, checkIsFavorited, getFavoriteAdventures, checkAdventureIsFavorited } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

interface CreatorUser {
  id: string;
  username?: string | null;
  full_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  gender?: string | null;
  created_at?: string;
  updated_at?: string;
}

const CreatorProfile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('bots');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [creatorUser, setCreatorUser] = useState<CreatorUser | null>(null);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<any[]>([]);
  const [favoriteAdventures, setFavoriteAdventures] = useState<any[]>([]);
  const [viewerFavoritedIds, setViewerFavoritedIds] = useState<string[]>([]);
  const [viewerFavoritedAdventureIds, setViewerFavoritedAdventureIds] = useState<string[]>([]);
  const [favoritesSubTab, setFavoritesSubTab] = useState('characters'); // 'characters' or 'adventures'

  // Stats state
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    likes: 0,
    publicBots: 0,
    favorites: 0,
    posts: 0
  });

  // Load creator profile and data from Supabase
  const loadCreatorData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Load creator user data from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading creator:', userError);
        toast.error('Creator not found');
        navigate(-1);
        return;
      }

      setCreatorUser(userData);

      // Load creator's characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*, messages(id)')
        .eq('owner_id', userId)
        .eq('visibility', 'public') // Only show public characters
        .order('created_at', { ascending: false });

      if (charactersError) {
        console.error('Error loading characters:', charactersError);
      } else {
        setUserCharacters(charactersData || []);
      }

      // Calculate stats
      const publicBotsCount = (charactersData || []).length;

      // Get total likes count on creator's characters
      const characterIds = (charactersData || []).map(char => char.id);
      let totalLikes = 0;

      if (characterIds.length > 0) {
        const { data: likesData, error: likesError } = await supabase
          .from('comments')
          .select('likes_count')
          .in('character_id', characterIds);

        if (!likesError && likesData) {
          totalLikes = likesData.reduce((sum, comment) => sum + (comment.likes_count || 0), 0);
        }
      }

      // Load creator's favorite characters
      const favoriteChars = await getFavoriteCharacters(userId);
      setFavoriteCharacters(favoriteChars);

      // If current user is viewing, get their favorited status for creator's characters
      if (user && characterIds.length > 0) {
        const viewerFavorites = await checkIsFavorited(user.id, characterIds);
        setViewerFavoritedIds(viewerFavorites);
      }

      // Estimate followers based on engagement
      const followersCount = Math.floor(totalLikes / 10) + publicBotsCount * 5;

      setStats({
        followers: followersCount,
        following: 0, // Not implemented yet
        likes: totalLikes,
        publicBots: publicBotsCount,
        favorites: favoriteChars.length,
        posts: 0 // Not implemented yet
      });

    } catch (error) {
      console.error('Error loading creator data:', error);
      toast.error('Failed to load creator profile');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCreatorData();
  }, [userId]);

  // Filter characters based on active tab
  const getCharactersForTab = () => {
    switch (activeTab) {
      case 'bots':
        return userCharacters;
      case 'favorites':
        return favoriteCharacters;
      case 'posts':
        // TODO: Implement posts functionality
        return [];
      default:
        return [];
    }
  };

  // Handle favorite status changes by viewers
  const handleFavoriteChange = async (characterId: string, isFavorited: boolean) => {
    if (isFavorited) {
      setViewerFavoritedIds(prev => [...prev, characterId]);
    } else {
      setViewerFavoritedIds(prev => prev.filter(id => id !== characterId));
    }
  };

  const displayCharacters = getCharactersForTab();

  const tabs = [
    { id: 'bots', label: 'Public Bots', count: stats.publicBots },
    { id: 'favorites', label: 'Favorites', count: stats.favorites },
    { id: 'posts', label: 'Post', count: stats.posts }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'chats', label: 'Chats' },
    { id: 'likes', label: 'Likes' }
  ];

  const FavoriteCharacterCard = ({ character }: { character: any }) => (
    <div className="character-card group cursor-pointer w-full bg-card rounded-2xl overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Star/Bookmark Icon */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white mb-1">
            {character.name}
          </h3>
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {character.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {character.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700/80 text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading if creator data is not yet available
  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading creator profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!creatorUser) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Creator not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        {/* Banner and Profile Section */}
        <div className="relative">
          {/* Banner */}
          <div
            className="h-64 bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center relative"
            style={creatorUser.banner_url ? { backgroundImage: `url(${creatorUser.banner_url})` } : {}}
          >
            {/* Dark glass overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Back button */}
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/20 hover:bg-black/40 text-white"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Profile Info - Positioned at bottom of banner */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end gap-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-white">
                  <AvatarImage src={creatorUser.avatar_url || ''} />
                  <AvatarFallback>{(creatorUser.full_name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{creatorUser.full_name || 'Unknown Creator'}</h1>
                  {creatorUser.bio && <p className="text-sm text-white/80">{creatorUser.bio}</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.followers}</div>
                  <div className="text-xs text-white/70">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.following}</div>
                  <div className="text-xs text-white/70">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.likes}</div>
                  <div className="text-xs text-white/70">Likes</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs and Sort */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-400 border-blue-400' 
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label} {tab.count}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className="text-sm"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Area */}
          {displayCharacters.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {displayCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={{
                    id: character.id,
                    name: character.name,
                    description: character.intro,
                    image: character.avatar_url || '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
                    category: character.tags?.[0] || 'General',
                    stats: {
                      messages: character.messages?.length || 0,
                      likes: 0 // Placeholder
                    },
                    isFavorited: viewerFavoritedIds.includes(character.id)
                  }}
                  onClick={() => navigate(`/character/${character.id}`)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <div className="text-2xl">💬</div>
              </div>
              <p className="text-muted-foreground text-sm">
                {activeTab === 'bots' ? 'No public bots yet.' :
                 activeTab === 'favorites' ? 'No favorites yet.' :
                 'No posts yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreatorProfile;
