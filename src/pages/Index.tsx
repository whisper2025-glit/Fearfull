import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterCardSkeleton } from "@/components/CharacterCardSkeleton";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase, getMessageCountsForCharacters, getFavoriteCountsForCharacters, checkIsFavorited } from "@/lib/supabase";
import { toast } from "sonner";
import { HomeFilters, SortOption } from "@/components/HomeFilters";
import { useUser } from "@clerk/clerk-react";
import { getFavoriteCharacters } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { PreferencesOnboardingModal } from "@/components/PreferencesOnboardingModal";
import { CreateModal } from "@/components/CreateModal";


const Index = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTag, setActiveTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('Recent Hits');
  const [gender, setGender] = useState<string>('Gender All');
  const [characters, setCharacters] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 24;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filteredCharacters, setFilteredCharacters] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Helper to check if user has completed onboarding
  const hasCompletedOnboarding = useCallback(() => {
    // In a real app, you'd store this in user metadata or a separate table
    // For this example, we'll simulate it. If user has a 'last_login' in supabase, assume onboarding is done.
    // This is a placeholder and needs a proper implementation.
    if (!user) return true; // Assume logged out users have completed it
    return user.unsafeMetadata?.onboardingCompleted === true;
  }, [user]);

  // Content filtering based on user's age preference
  const filterCharactersByContentLevel = useCallback((chars: any[]) => {
    // Placeholder for actual age preference retrieval from user profile/metadata
    // For now, we'll use a simulated value or check if user is logged in
    const userAgePreference = user?.unsafeMetadata?.agePreference || 18; // Default to 18 if not set

    if (userAgePreference < 18) {
      return chars.filter(char => !char.isNsfw); // Filter out NSFW characters
    } else if (userAgePreference >= 18 && userAgePreference <= 20) {
      return chars.filter(char => !char.isHighlyNsfw); // Filter out highly NSFW characters
    }
    return chars; // Show all if 20+
  }, [user]);

  // Paginated fetch
  const fetchPage = useCallback(async (pageToLoad: number) => {
    if (isLoadingMore) return;
    if (pageToLoad === 0) setIsLoading(true); else setIsLoadingMore(true);

    try {
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('characters')
        .select('*')
        .eq('visibility', 'public');

      if (gender !== 'Gender All') {
        const g = gender.replace('Gender ', '');
        query = query.eq('gender', g);
      }

      if (activeTag) {
        query = query.contains('tags', [activeTag]);
      }

      const { data: charactersData, error: charactersError } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (charactersError) {
        console.error('Error loading characters:', charactersError);
        toast.error('Failed to load characters');
        setHasMore(false);
        return;
      }

      const transformed = (charactersData || []).map((char: any) => ({
        id: char.id,
        name: char.name,
        description: char.intro,
        image: char.avatar_url || '/placeholder.svg',
        category: char.tags?.[0] || 'General',
        tags: Array.isArray(char.tags) ? char.tags : [],
        created_at: char.created_at,
        gender: char.gender || null,
        stats: { messages: 0, likes: 0 },
        isNsfw: char.is_nsfw || false, // Assuming a property in your DB
        isHighlyNsfw: char.is_highly_nsfw || false, // Assuming a property in your DB
      }));

      const ids = transformed.map((c: any) => c.id);
      const [msgCounts, favCounts, favoritedIds] = await Promise.all([
        getMessageCountsForCharacters(ids),
        getFavoriteCountsForCharacters(ids),
        (isSignedIn && user) ? checkIsFavorited(user.id, ids) : Promise.resolve([] as string[])
      ]);

      const withStats = transformed.map((c: any) => ({
        ...c,
        stats: {
          messages: msgCounts[c.id] ?? 0,
          likes: favCounts[c.id] ?? 0
        },
        isFavorited: favoritedIds.includes(c.id)
      }));

      setCharacters(prev => pageToLoad === 0 ? withStats : [...prev, ...withStats]);
      setHasMore((charactersData || []).length === PAGE_SIZE);
      setPage(pageToLoad);
      if (pageToLoad > 0) {
        trackEvent('load_more', { page: pageToLoad, page_size: PAGE_SIZE });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      setHasMore(false);
    } finally {
      if (pageToLoad === 0) setIsLoading(false); else setIsLoadingMore(false);
    }
  }, [PAGE_SIZE, isLoadingMore, isSignedIn, user, gender, activeTag]);

  const applyFilters = useCallback(() => {
    let filtered = characters;

    // Apply content filtering first
    filtered = filterCharactersByContentLevel(characters);

    // Apply other filters
    if (gender !== 'Gender All') {
      const g = gender.replace('Gender ', '');
      filtered = filtered.filter((c) => (c.gender ? c.gender === g : true));
    }

    if (activeTag) {
      filtered = filtered.filter((c) => (c.tags || []).includes(activeTag) || c.category === activeTag);
    }

    if (sortBy === 'Following') {
      if (favoriteIds.length > 0) {
        filtered = filtered.filter((c) => favoriteIds.includes(c.id));
      } else if (isSignedIn) {
        filtered = [];
      }
    }
    setFilteredCharacters(filtered);
  }, [characters, activeTag, sortBy, gender, favoriteIds, isSignedIn, filterCharactersByContentLevel]);


  useEffect(() => {
    // Initialize from URL once on mount
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') as SortOption | null;
    const g = searchParams.get('gender');
    if (tag) setActiveTag(tag);
    if (sort && ['Popular','Recent Hits','Trending','New','Daily Ranking','Editor Choice','Following'].includes(sort)) setSortBy(sort);
    if (g) setGender(g);

    // Reset list state; actual fetching is handled by the filter-change effect below
    setCharacters([]);
    setHasMore(true);
    setPage(0);
  }, []);

  useEffect(() => {
    // Check if user needs onboarding
    if (user && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user, hasCompletedOnboarding]);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]); // fetchPage will re-run if dependencies change

  useEffect(() => {
    applyFilters();
  }, [characters, activeTag, sortBy, gender, favoriteIds, isSignedIn, applyFilters]); // Re-apply filters when relevant state changes

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isSignedIn || !user) return;
      const favs = await getFavoriteCharacters(user.id);
      const ids = (favs || []).map((c: any) => c.id).filter(Boolean);
      setFavoriteIds(ids);
    };
    if (sortBy === 'Following') {
      loadFavorites();
    }
  }, [sortBy, isSignedIn, user]);

  const visibleCharacters = useMemo(() => {
    let list = filteredCharacters;

    // Sorting is now applied directly in applyFilters or handled by backend.
    // If specific client-side sorting is needed here, it would be applied to `filteredCharacters`.
    // For now, assuming backend handles most sorting and applyFilters handles client-side logic.

    switch (sortBy) {
      case 'New':
        return [...list].sort((a, b) => (b.created_at?.localeCompare?.(a.created_at) ?? 0));
      case 'Trending':
        return [...list].sort((a, b) => (b.stats.messages - a.stats.messages));
      case 'Popular':
      case 'Daily Ranking':
      case 'Editor Choice':
        return [...list].sort((a, b) => (b.stats.likes - a.stats.likes));
      case 'Recent Hits':
      default:
        return [...list].sort((a, b) => ((b.stats.likes + b.stats.messages * 2) - (a.stats.likes + a.stats.messages * 2)));
    }
  }, [filteredCharacters, sortBy]);

  // Observer to trigger loading more
  useEffect(() => {
    if (!hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLoadingMore) {
        fetchPage(page + 1);
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPage, page, hasMore, isLoadingMore]);

  return (
    <Layout
      headerBorder={false}
      headerBottomBorder={false}
      headerPosition="fixed"
      headerBottom={
        <HomeFilters
          activeTag={activeTag}
          onTagChange={setActiveTag}
          sortBy={sortBy}
          onSortChange={setSortBy}
          gender={gender}
          onGenderChange={setGender}
        />
      }
    >
      <div className="p-4 space-y-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleCharacters.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No characters found for this filter</p>
              <Button onClick={() => { trackEvent('click_create_character'); navigate('/create'); }}>Create Your First Character</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {visibleCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onClick={() => { trackEvent('open_character', { character_id: character.id }); navigate(`/character/${character.id}`); }}
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="h-8" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="md" />
              </div>
            )}
          </>
        )}
      </div>

      <CreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <PreferencesOnboardingModal
        open={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          // Reload characters with new filtering
          applyFilters(); // Re-apply filters to update the displayed characters
        }}
      />
    </Layout>
  );
};

export default Index;