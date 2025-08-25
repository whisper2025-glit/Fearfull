
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Character {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  stats: {
    messages: number;
    likes: number;
  };
}

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <div 
      className="character-card group cursor-pointer w-full"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={character.image} 
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {character.category && (
          <div className="absolute top-2 right-2">
            <span className="stats-badge bg-primary/20 text-primary border border-primary/30 text-[10px]">
              {character.category}
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
            {character.name}
          </h3>
          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
            {character.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="stats-badge">
                <MessageCircle className="h-2.5 w-2.5" />
                <span className="text-[10px]">{character.stats.messages}</span>
              </div>
              <div className="stats-badge">
                <Heart className="h-2.5 w-2.5" />
                <span className="text-[10px]">{character.stats.likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
