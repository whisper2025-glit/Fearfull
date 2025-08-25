import { Layout } from "@/components/Layout";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Anime', 'Game', 'Movies & TV', 'Books', 'Religion', 'Image Generating', 'Discussion', 'Language Learning', 'History'];

  const characters = [
    {
      id: 1,
      name: 'Aiden',
      description: 'A mysterious detective with a sharp mind',
      image: '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
      category: 'Anime',
      stats: { messages: 1234, likes: 567 }
    },
    {
      id: 2,
      name: 'Luna',
      description: 'An ancient sorceress wielding powerful magic',
      image: '/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png',
      category: 'Fantasy',
      stats: { messages: 2156, likes: 892 }
    },
    {
      id: 3,
      name: 'Marcus',
      description: 'A brave knight on a quest for justice',
      image: '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
      category: 'Adventure',
      stats: { messages: 876, likes: 234 }
    },
    {
      id: 4,
      name: 'Aria',
      description: 'A talented musician with a mysterious past',
      image: '/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png',
      category: 'Romance',
      stats: { messages: 3421, likes: 1567 }
    },
    {
      id: 5,
      name: 'Zyx',
      description: 'An alien explorer from distant galaxies',
      image: '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
      category: 'Sci-Fi',
      stats: { messages: 987, likes: 432 }
    },
    {
      id: 6,
      name: 'Nova',
      description: 'A brilliant scientist discovering new worlds',
      image: '/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png',
      category: 'Sci-Fi',
      stats: { messages: 1876, likes: 743 }
    }
  ];

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
          <div className="grid grid-cols-2 gap-4">
            {filteredCharacters.map((character) => (
              <CharacterCard 
                key={character.id} 
                character={character} 
                onClick={() => navigate(`/chat/${character.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
