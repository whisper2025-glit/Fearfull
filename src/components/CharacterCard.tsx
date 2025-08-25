
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CharacterCardProps {
  name: string;
  description: string;
  imageUrl: string;
  messageCount: string;
  likeCount: string;
  category?: string;
}

export function CharacterCard({ 
  name, 
  description, 
  imageUrl, 
  messageCount, 
  likeCount,
  category 
}: CharacterCardProps) {
  return (
    <div className="character-card group cursor-pointer">
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
          <div className="absolute top-3 right-3">
            <span className="stats-badge bg-primary/20 text-primary border border-primary/30">
              {category}
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="stats-badge">
                <MessageCircle className="h-3 w-3" />
                <span>{messageCount}</span>
              </div>
              <div className="stats-badge">
                <Heart className="h-3 w-3" />
                <span>{likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
