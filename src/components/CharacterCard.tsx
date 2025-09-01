import { Heart, MessageCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { favoriteCharacter } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  stats: {
    messages: number;
    likes: number;
  };
  isFavorited?: boolean;
}

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
  onFavoriteChange?: (characterId: string, isFavorited: boolean) => void;
  showEditButton?: boolean;
  onEditClick?: (characterId: string) => void;
}

export function CharacterCard({ character, onClick, onFavoriteChange }: CharacterCardProps) {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(character.isFavorited || false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      toast.error('Please sign in to favorite characters');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const newFavoriteStatus = await favoriteCharacter(user.id, character.id);
      setIsFavorited(newFavoriteStatus);

      if (onFavoriteChange) {
        onFavoriteChange(character.id, newFavoriteStatus);
      }

      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error favoriting character:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsProcessing(false);
    }
  };
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
        
        {/* Favorite Button */}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorited
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'
                : 'bg-black/20 hover:bg-black/40 text-white/60 hover:text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleFavoriteClick}
            disabled={isProcessing}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isFavorited ? 'fill-cyan-400 text-cyan-400' : ''
              }`}
            />
          </Button>
        </div>

        {/* Category Badge */}
        {character.category && character.category.toLowerCase() !== 'general' && (
          <div className="absolute top-2 left-2">
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
