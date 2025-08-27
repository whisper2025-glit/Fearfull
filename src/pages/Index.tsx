import { Layout } from "@/components/Layout";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CharacterCard } from "@/components/CharacterCard";
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
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Anime', 'Game', 'Movies & TV', 'Books', 'Religion', 'Image Generating', 'Discussion', 'Language Learning', 'History'];

  // Load public characters from Supabase
  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('characters')
          .select(`
            *,
            users!characters_owner_id_fkey(full_name),
            messages(id)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading characters:', error);
          toast.error('Failed to load characters');
          return;
        }

        // Transform Supabase data to match expected format
        const transformedCharacters = (data || []).map(char => ({
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
      } catch (error) {
        console.error('Error loading characters:', error);
        toast.error('Failed to load characters');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const filteredCharacters = activeCategory === 'All'
    ? characters
    : characters.filter(char => char.category === activeCategory);

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Category Tabs */}
          <CategoryTabs 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Character Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Loading characters...</p>
              </div>
            </div>
          ) : filteredCharacters.length === 0 ? (
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
