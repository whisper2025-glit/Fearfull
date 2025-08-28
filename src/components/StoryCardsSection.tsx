import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Upload, Edit } from "lucide-react";

interface StoryCard {
  id: string;
  name: string;
  type: 'character' | 'class' | 'race' | 'location' | 'faction' | 'custom';
  description: string;
  image?: string;
}

interface StoryCardsSectionProps {
  storyCards: StoryCard[];
  onAddCard: () => void;
  onUpdateCard: (id: string, updates: Partial<StoryCard>) => void;
  onRemoveCard: (id: string) => void;
}

export const StoryCardsSection: React.FC<StoryCardsSectionProps> = ({
  storyCards,
  onAddCard,
  onUpdateCard,
  onRemoveCard
}) => {
  const [editingCard, setEditingCard] = useState<StoryCard | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCard, setNewCard] = useState<Omit<StoryCard, 'id'>>({
    name: '',
    type: 'character',
    description: '',
    image: ''
  });

  const storyCardTypes = [
    { value: 'character', label: 'Character' },
    { value: 'class', label: 'Class' },
    { value: 'race', label: 'Race' },
    { value: 'location', label: 'Location' },
    { value: 'faction', label: 'Faction' },
    { value: 'custom', label: 'Custom' }
  ];

  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      callback(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCard = () => {
    if (!newCard.name.trim()) return;
    
    const card: StoryCard = {
      id: Date.now().toString(),
      ...newCard
    };
    
    onAddCard();
    onUpdateCard(card.id, card);
    setNewCard({ name: '', type: 'character', description: '', image: '' });
    setIsCreateModalOpen(false);
  };

  const handleUpdateCard = () => {
    if (!editingCard) return;
    onUpdateCard(editingCard.id, editingCard);
    setEditingCard(null);
  };

  const CreateCardModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-md bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Create Story Card</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-primary text-sm font-medium">Type</Label>
            <Select value={newCard.type} onValueChange={(value) => setNewCard(prev => ({ ...prev, type: value as any }))}>
              <SelectTrigger className="text-xs bg-secondary/50 border-border rounded-lg h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {storyCardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs py-2">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-primary text-sm font-medium">Name</Label>
            <Input
              placeholder="Enter name..."
              value={newCard.name}
              onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
              className="text-xs bg-secondary/50 border-border rounded-lg h-10"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-primary text-sm font-medium">Image (Optional)</Label>
            <div
              className="w-full h-32 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
              onClick={() => document.getElementById('new-card-image-input')?.click()}
            >
              {newCard.image ? (
                <img
                  src={newCard.image}
                  alt="Card preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs">Upload image</p>
                </div>
              )}
              <input
                id="new-card-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, (url) => {
                      setNewCard(prev => ({ ...prev, image: url }));
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-primary text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe this story element..."
              value={newCard.description}
              onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px] text-xs bg-secondary/50 border-border rounded-lg resize-none"
            />
            <p className="text-muted-foreground text-xs">{newCard.description.length} / 1000</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCreateModalOpen(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCard}
            disabled={!newCard.name.trim()}
            className="text-xs bg-primary hover:bg-primary/90"
          >
            Create Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const EditCardModal = () => (
    <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
      <DialogContent className="max-w-md bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Story Card</DialogTitle>
        </DialogHeader>
        
        {editingCard && (
          <div className="space-y-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-primary text-sm font-medium">Type</Label>
              <Select 
                value={editingCard.type} 
                onValueChange={(value) => setEditingCard(prev => prev ? ({ ...prev, type: value as any }) : null)}
              >
                <SelectTrigger className="text-xs bg-secondary/50 border-border rounded-lg h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  {storyCardTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs py-2">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-primary text-sm font-medium">Name</Label>
              <Input
                placeholder="Enter name..."
                value={editingCard.name}
                onChange={(e) => setEditingCard(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                className="text-xs bg-secondary/50 border-border rounded-lg h-10"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-primary text-sm font-medium">Image (Optional)</Label>
              <div
                className="w-full h-32 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => document.getElementById('edit-card-image-input')?.click()}
              >
                {editingCard.image ? (
                  <img
                    src={editingCard.image}
                    alt="Card preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">Upload image</p>
                  </div>
                )}
                <input
                  id="edit-card-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && editingCard) {
                      handleImageUpload(file, (url) => {
                        setEditingCard(prev => prev ? ({ ...prev, image: url }) : null);
                      });
                    }
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-primary text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Describe this story element..."
                value={editingCard.description}
                onChange={(e) => setEditingCard(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                className="min-h-[80px] text-xs bg-secondary/50 border-border rounded-lg resize-none"
              />
              <p className="text-muted-foreground text-xs">{editingCard.description.length} / 1000</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditingCard(null)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCard}
            disabled={!editingCard?.name.trim()}
            className="text-xs bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-primary text-sm font-medium">Story Cards</Label>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="text-xs bg-primary hover:bg-primary/90 h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Card
        </Button>
      </div>
      
      <p className="text-muted-foreground text-xs leading-relaxed">
        Story cards are used by AI to understand characters, places, factions, and other story elements. 
        They help provide context and consistency to the adventure.
      </p>

      {/* Horizontal Scrollable Cards */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Add Card Button */}
          <div
            className="min-w-[200px] h-48 bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="flex flex-col items-center space-y-2">
              <Plus className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-xs font-medium text-center">
                Add character<br />info, location,<br />faction, and more
              </p>
            </div>
          </div>

          {/* Story Cards */}
          {storyCards.map((card) => (
            <div
              key={card.id}
              className="min-w-[200px] h-48 bg-secondary/50 rounded-lg border border-border relative group"
            >
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => onRemoveCard(card.id)}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Edit Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 h-6 w-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => setEditingCard(card)}
              >
                <Edit className="h-3 w-3" />
              </Button>

              {/* Card Image */}
              <div className="w-full h-32 bg-muted rounded-t-lg overflow-hidden">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <span className="text-2xl">{card.type === 'character' ? '👤' : card.type === 'location' ? '🏛️' : card.type === 'faction' ? '⚔️' : '📜'}</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-primary truncate">{card.name || 'Unnamed'}</h4>
                  <span className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded capitalize">
                    {card.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {card.description || 'No description'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateCardModal />
      <EditCardModal />
    </div>
  );
};
