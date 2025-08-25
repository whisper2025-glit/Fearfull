
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CharacterCardProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  messageCount: string;
  likeCount: string;
  category?: string;
}

export function CharacterCard({ 
  id,
  name, 
  description, 
  imageUrl, 
  messageCount, 
  likeCount,
  category 
}: CharacterCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${id}`);
  };

  return (
    <div 
      className="character-card group cursor-pointer w-full"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-2 right-2">
            <span className="stats-badge bg-primary/20 text-primary border border-primary/30 text-[10px]">
              {category}
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
            {description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="stats-badge">
                <MessageCircle className="h-2.5 w-2.5" />
                <span className="text-[10px]">{messageCount}</span>
              </div>
              <div className="stats-badge">
                <Heart className="h-2.5 w-2.5" />
                <span className="text-[10px]">{likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
