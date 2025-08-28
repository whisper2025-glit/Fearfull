import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Star, MoreHorizontal } from "lucide-react";

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

interface AdventureCardProps {
  adventure: Adventure;
  onFavorite?: (adventureId: string) => void;
  isFavorited?: boolean;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({
  adventure,
  onFavorite,
  isFavorited = false
}) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate(`/adventure/${adventure.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(adventure.id);
  };

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'all-ages':
        return 'bg-green-600 text-white';
      case 'teens':
        return 'bg-yellow-600 text-white';
      case 'adults':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'all-ages':
        return '0+';
      case 'teens':
        return '13+';
      case 'adults':
        return '18+';
      default:
        return rating;
    }
  };

  return (
    <Card
      className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 cursor-pointer transition-all duration-200 group overflow-hidden"
      onClick={handlePlay}
    >
      <CardContent className="p-0">
        {/* Adventure Image */}
        <div className="relative h-48 overflow-hidden">
          {adventure.adventure_image_url ? (
            <img
              src={adventure.adventure_image_url}
              alt={adventure.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-4xl opacity-50">🏰</span>
            </div>
          )}
          
          {/* Overlay with badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            {adventure.category && (
              <Badge 
                variant="secondary" 
                className="bg-black/50 text-white text-xs"
              >
                {adventure.category}
              </Badge>
            )}
            <Badge 
              className={`text-xs ${getRatingBadgeColor(adventure.rating)}`}
            >
              {getRatingLabel(adventure.rating)}
            </Badge>
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              onClick={handleFavorite}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 font-medium shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
            >
              Play Adventure
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">
              {adventure.name}
            </h3>
            {adventure.users?.full_name && (
              <p className="text-sm text-muted-foreground">
                by {adventure.users.full_name}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {adventure.plot}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>0 playing</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>New</span>
              </div>
            </div>
            
            <Badge 
              variant={adventure.visibility === 'public' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {adventure.visibility}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
