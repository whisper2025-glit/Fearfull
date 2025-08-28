import { Layout } from "@/components/Layout";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CharacterCard } from "@/components/CharacterCard";
import { AdventureCard } from "@/components/AdventureCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [characters, setCharacters] = useState<any[]>([]);
  const [adventures, setAdventures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentType, setContentType] = useState<'characters' | 'adventures'>('characters');

  const categories = ['All', 'Anime', 'Game', 'Movies & TV', 'Books', 'Religion', 'Image Generating', 'Discussion', 'Language Learning', 'History'];

  // Load public characters and adventures from Supabase
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Load characters
        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select(`
            *,
            users!characters_owner_id_fkey(full_name),
            messages(id)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (charactersError) {
          console.error('Error loading characters:', charactersError);
          toast.error('Failed to load characters');
        } else {
          // Transform Supabase data to match expected format
          const transformedCharacters = (charactersData || []).map(char => ({
            id: char.id,
            name: char.name,
            description: char.intro,
            image: char.avatar_url || '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
            category: char.tags?.[0] || 'General',
            stats: {
              messages: char.messages?.length || 0,
              likes: Math.floor(Math.random() * 1000) // Placeholder for now
            }
          }));
          setCharacters(transformedCharacters);
        }

        // Load adventures
        const { data: adventuresData, error: adventuresError } = await supabase
          .from('adventures')
          .select(`
            *,
            users!adventures_owner_id_fkey(full_name)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (adventuresError) {
          console.error('Error loading adventures:', adventuresError);
          toast.error('Failed to load adventures');
        } else {
          setAdventures(adventuresData || []);
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

  const filteredCharacters = activeCategory === 'All'
    ? characters
    : characters.filter(char => char.category === activeCategory);

  const filteredAdventures = activeCategory === 'All'
    ? adventures
    : adventures.filter(adventure => adventure.category === activeCategory.toLowerCase());

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Content Type Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setContentType('characters')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                contentType === 'characters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Characters
            </button>
            <button
              onClick={() => setContentType('adventures')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                contentType === 'adventures'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Adventures
            </button>
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Content Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Loading {contentType}...</p>
              </div>
            </div>
          ) : contentType === 'characters' ? (
            filteredCharacters.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No characters found for this category</p>
                  <Button onClick={() => navigate('/create')}>Create Your First Character</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => navigate(`/character/${character.id}`)}
                  />
                ))}
              </div>
            )
          ) : (
            filteredAdventures.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No adventures found for this category</p>
                  <Button onClick={() => navigate('/create-adventure')}>Create Your First Adventure</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdventures.map((adventure) => (
                  <AdventureCard
                    key={adventure.id}
                    adventure={adventure}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
