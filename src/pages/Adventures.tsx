import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { AdventureCard } from "@/components/AdventureCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Adventure {
  id: string;
  name: string;
  plot: string;
  introduction: string;
  adventure_image_url?: string;
  category?: string;
  rating: 'all-ages' | 'teens' | 'adults';
  visibility: 'public' | 'private';
  created_at: string;
  users?: {
    full_name: string;
  };
}

interface CategoryData {
  name: string;
  displayName: string;
  adventures: Adventure[];
}

const Adventures = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define adventure categories
  const adventureCategories = [
    { name: 'fantasy', displayName: 'Fantasy' },
    { name: 'sci-fi', displayName: 'Sci-Fi' },
    { name: 'horror', displayName: 'Horror' },
    { name: 'romance', displayName: 'Romance' },
    { name: 'adventure', displayName: 'Adventure' },
    { name: 'mystery', displayName: 'Mystery' },
    { name: 'historical', displayName: 'Historical' },
    { name: 'modern', displayName: 'Modern' },
    { name: 'post-apocalyptic', displayName: 'Post-Apocalyptic' },
    { name: 'cyberpunk', displayName: 'Cyberpunk' },
    { name: 'steampunk', displayName: 'Steampunk' },
    { name: 'other', displayName: 'Other' }
  ];

  useEffect(() => {
    const loadAdventures = async () => {
      try {
        setIsLoading(true);

        // Load all public adventures using basic client
        console.log('🔍 Loading adventures...');

        const { data: adventuresData, error } = await supabase
          .from('adventures')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        console.log('📊 Adventures query result:', { adventuresData, error });

        if (error) {
          console.error('❌ Error loading adventures:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          toast.error(`Failed to load adventures: ${error.message}`);
          return;
        }

        if (!adventuresData) {
          console.log('⚠️ No adventures data returned');
          toast.error('No adventures found');
          return;
        }

        console.log('✅ Adventures loaded successfully:', adventuresData.length, 'adventures');

        // Group adventures by category
        const categorizedAdventures: CategoryData[] = adventureCategories.map(category => ({
          name: category.name,
          displayName: category.displayName,
          adventures: (adventuresData || []).filter(adventure => 
            adventure.category === category.name || 
            (category.name === 'other' && !adventure.category)
          )
        })).filter(category => category.adventures.length > 0); // Only show categories with adventures

        setCategories(categorizedAdventures);
      } catch (error) {
        console.error('Error loading adventures:', error);
        toast.error('Failed to load adventures');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdventures();
  }, []);

  const scrollCategory = (categoryName: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`category-${categoryName}`);
    if (container) {
      const scrollAmount = 320; // Width of one card plus gap
      const currentScroll = container.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading adventures...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Adventures</h1>
                <p className="text-muted-foreground mt-1">Discover and play interactive story adventures</p>
              </div>
              <Button
                onClick={() => navigate('/create-adventure')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Adventure
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-6 space-y-8">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">No adventures found</p>
                <p className="text-muted-foreground">Be the first to create an adventure!</p>
                <Button
                  onClick={() => navigate('/create-adventure')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Adventure
                </Button>
              </div>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.name} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {category.displayName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {category.adventures.length} adventure{category.adventures.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/adventures?category=${category.name}`)}
                    className="text-primary hover:text-primary/80"
                  >
                    View All
                  </Button>
                </div>

                {/* Horizontal Scrollable Adventure Cards */}
                <div className="relative group">
                  <div
                    id={`category-${category.name}`}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
                    style={{
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    {category.adventures.map((adventure) => (
                      <div
                        key={adventure.id}
                        className="flex-none w-80 transition-transform duration-200 hover:scale-[1.02]"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <AdventureCard adventure={adventure} />
                      </div>
                    ))}

                    {/* Add more cards to simulate infinite scrolling effect */}
                    {category.adventures.length > 3 && category.adventures.slice(0, 3).map((adventure) => (
                      <div
                        key={`duplicate-${adventure.id}`}
                        className="flex-none w-80 transition-transform duration-200 hover:scale-[1.02]"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <AdventureCard adventure={adventure} />
                      </div>
                    ))}

                    {/* Add spacing at the end for better scroll experience */}
                    <div className="flex-none w-8" />
                  </div>

                  {/* Gradient overlays for smooth edges */}
                  <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                  <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

                  {/* Navigation arrows - visible on hover */}
                  <button
                    onClick={() => scrollCategory(category.name, 'left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background/90"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollCategory(category.name, 'right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background/90"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbars */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Layout>
  );
};

export default Adventures;
