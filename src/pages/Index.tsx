import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase, getMessageCountsForCharacters, getFavoriteCountsForCharacters, checkIsFavorited } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HomeFilters, SortOption } from "@/components/HomeFilters";
import { useUser } from "@clerk/clerk-react";
import { getFavoriteCharacters } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [activeTag, setActiveTag] = useState<string>('For You');
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

      if (activeTag && activeTag !== 'For You') {
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
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      setHasMore(false);
    } finally {
      if (pageToLoad === 0) setIsLoading(false); else setIsLoadingMore(false);
    }
  }, [PAGE_SIZE, isLoadingMore, isSignedIn, user, gender, activeTag]);

  useEffect(() => {
    // Initial load
    setCharacters([]);
    setHasMore(true);
    fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    setCharacters([]);
    setHasMore(true);
    setPage(0);
    fetchPage(0);
  }, [activeTag, gender]);

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
    let list = characters;

    if (gender !== 'Gender All') {
      const g = gender.replace('Gender ', '');
      list = list.filter((c) => (c.gender ? c.gender === g : true));
    }

    if (activeTag && activeTag !== 'For You') {
      list = list.filter((c) => (c.tags || []).includes(activeTag) || c.category === activeTag);
    }

    if (sortBy === 'Following') {
      if (favoriteIds.length > 0) {
        list = list.filter((c) => favoriteIds.includes(c.id));
      } else if (isSignedIn) {
        list = [];
      }
    }

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
  }, [characters, activeTag, sortBy, gender, favoriteIds, isSignedIn]);

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
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading characters...</p>
            </div>
          </div>
        ) : visibleCharacters.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No characters found for this filter</p>
              <Button onClick={() => navigate('/create')}>Create Your First Character</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {visibleCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onClick={() => navigate(`/character/${character.id}`)}
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="h-8" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
