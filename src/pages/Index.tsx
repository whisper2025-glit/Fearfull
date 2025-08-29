import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

  // Load public characters from Supabase
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (charactersError) {
          console.error('Error loading characters:', charactersError);
          toast.error('Failed to load characters');
        } else {
          const transformedCharacters = (charactersData || []).map((char: any) => ({
            id: char.id,
            name: char.name,
            description: char.intro,
            image: char.avatar_url || '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
            category: char.tags?.[0] || 'General',
            tags: Array.isArray(char.tags) ? char.tags : [],
            created_at: char.created_at,
            gender: char.gender || null,
            stats: {
              messages: Array.isArray(char.messages) ? char.messages.length : 0,
              likes: Math.floor(Math.random() * 1000)
            }
          }));
          setCharacters(transformedCharacters);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

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
  }, [characters, activeTag, sortBy, gender]);

  return (
    <Layout
      headerBorder={false}
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
      <div className="p-4 space-y-6">
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
          <div className="grid grid-cols-2 gap-4">
            {visibleCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => navigate(`/character/${character.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
