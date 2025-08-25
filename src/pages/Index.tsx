
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { CategoryTabs } from "@/components/CategoryTabs";

// Mock character data
const characters = [
  {
    id: 1,
    name: "Free Use Law RPG",
    description: "A new law where anyone can screw anyone...",
    imageUrl: "/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png",
    messageCount: "10.1m",
    likeCount: "1.7k",
    category: "RPG"
  },
  {
    id: 2,
    name: "Class 1-A",
    description: "You're the New student!",
    imageUrl: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
    messageCount: "8.4m",
    likeCount: "1.1k",
    category: "Anime"
  },
  {
    id: 3,
    name: "Shylily",
    description: "shylily wants to show you a magic trick",
    imageUrl: "/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png",
    messageCount: "453.1k",
    likeCount: "391"
  },
  {
    id: 4,
    name: "William Van De Laar",
    description: "Your father hates you because he blames you...",
    imageUrl: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
    messageCount: "46.0k",
    likeCount: "16"
  },
  {
    id: 5,
    name: "Luna",
    description: "A mysterious AI companion ready for adventure",
    imageUrl: "/lovable-uploads/f455db46-8eae-4432-a644-f977619b90eb.png",
    messageCount: "2.3m",
    likeCount: "890"
  },
  {
    id: 6,
    name: "Professor Akira",
    description: "Your brilliant teacher with hidden secrets",
    imageUrl: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png",
    messageCount: "1.8m",
    likeCount: "654"
  }
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("for-you");

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Category Tabs */}
        <CategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              id={character.id}
              name={character.name}
              description={character.description}
              imageUrl={character.imageUrl}
              messageCount={character.messageCount}
              likeCount={character.likeCount}
              category={character.category}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-full font-medium transition-colors">
            Load More Characters
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
