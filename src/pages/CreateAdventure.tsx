import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Info, Plus, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase, uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { StoryCardsSection } from "@/components/StoryCardsSection";

type AdventureType = 'mcp' | 'custom';
type RatingType = 'all-ages' | 'teens' | 'adults';

interface StoryCard {
  id: string;
  name: string;
  type: 'character' | 'class' | 'race' | 'location' | 'faction' | 'custom';
  description: string;
  image?: string;
}

const CreateAdventure = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [adventureType, setAdventureType] = useState<AdventureType>('custom');
  
  const [formData, setFormData] = useState({
    name: '',
    plot: '',
    introduction: '',
    adventureImage: '',
    backgroundImage: '',
    
    // MCP Server fields
    sourceStory: '',
    mcpSettings: '',
    
    // Custom fields
    customSettings: '',
    aiInstructions: '',
    storySummary: '',
    plotEssentials: '',
    
    // Common fields
    category: '',
    rating: 'all-ages' as RatingType,
    persona: '',
    visibility: 'public'
  });

  const [storyCards, setStoryCards] = useState<StoryCard[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'adventureImage' | 'backgroundImage', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const addStoryCard = () => {
    const newCard: StoryCard = {
      id: Date.now().toString(),
      name: '',
      type: 'character',
      description: ''
    };
    setStoryCards(prev => [...prev, newCard]);
  };

  const updateStoryCard = (id: string, updates: Partial<StoryCard>) => {
    setStoryCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const removeStoryCard = (id: string) => {
    setStoryCards(prev => prev.filter(card => card.id !== id));
  };

  const categories = [
    'Fantasy', 'Sci-Fi', 'Horror', 'Romance', 'Adventure', 'Mystery', 
    'Historical', 'Modern', 'Post-Apocalyptic', 'Cyberpunk', 'Steampunk', 'Other'
  ];

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const handleSave = async () => {
    if (!user || !formData.name || !formData.plot) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsCreating(true);
    try {
      let adventureImageUrl = null;
      let backgroundImageUrl = null;

      // Upload adventure image if provided
      if (formData.adventureImage) {
        try {
          const response = await fetch(formData.adventureImage);
          const blob = await response.blob();
          const file = new File([blob], 'adventure-image.jpg', { type: blob.type });
          const imagePath = `${user.id}/adventures/${Date.now()}.jpg`;
          const { publicUrl } = await uploadImage('adventures', imagePath, file);
          adventureImageUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading adventure image:', error);
          toast.error('Failed to upload adventure image');
        }
      }

      // Upload background image if provided
      if (formData.backgroundImage) {
        try {
          const response = await fetch(formData.backgroundImage);
          const blob = await response.blob();
          const file = new File([blob], 'background-image.jpg', { type: blob.type });
          const imagePath = `${user.id}/backgrounds/${Date.now()}.jpg`;
          const { publicUrl } = await uploadImage('backgrounds', imagePath, file);
          backgroundImageUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading background image:', error);
          toast.error('Failed to upload background image');
        }
      }

      // Create adventure in Supabase
      const { data: adventureData, error } = await supabase
        .from('adventures')
        .insert({
          owner_id: user.id,
          name: formData.name,
          plot: formData.plot,
          introduction: formData.introduction,
          adventure_image_url: adventureImageUrl,
          background_image_url: backgroundImageUrl,
          adventure_type: adventureType,
          source_story: adventureType === 'mcp' ? formData.sourceStory : null,
          mcp_settings: adventureType === 'mcp' ? formData.mcpSettings : null,
          custom_settings: adventureType === 'custom' ? formData.customSettings : null,
          ai_instructions: adventureType === 'custom' ? formData.aiInstructions : null,
          story_summary: adventureType === 'custom' ? formData.storySummary : null,
          plot_essentials: adventureType === 'custom' ? formData.plotEssentials : null,
          story_cards: adventureType === 'custom' ? storyCards : null,
          category: formData.category,
          rating: formData.rating,
          persona: formData.persona,
          visibility: formData.visibility as 'public' | 'private'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating adventure:', error);
        toast.error('Failed to create adventure');
        return;
      }

      toast.success('Adventure created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating adventure:', error);
      toast.error('Failed to create adventure');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-primary font-medium text-sm">New Adventure...</h1>
              <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                Draft
              </span>
            </div>
          </div>
          <Button variant="ghost" className="text-muted-foreground text-xs flex items-center gap-1 hover:bg-secondary/50">
            <div className="bg-muted rounded p-1">
              <Info className="h-4 w-4" />
            </div>
            <span>View Guide</span>
          </Button>
        </div>

        {/* Form Content */}
        <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
          {/* Name Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-primary text-sm font-medium flex items-center gap-2">
              Adventure Name <span className="text-primary">*</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Input
              id="name"
              placeholder="Give your adventure an exciting name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="text-xs bg-secondary/50 border-border rounded-lg h-12 placeholder:text-muted-foreground/70"
            />
            <p className="text-muted-foreground text-xs">{getCharacterCount(formData.name)} characters</p>
          </div>

          {/* Adventure Image */}
          <div className="space-y-4">
            <h3 className="text-primary text-sm font-medium">Adventure Image</h3>
            <div
              className="w-full h-48 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
              onClick={() => document.getElementById('adventure-image-input')?.click()}
            >
              {formData.adventureImage ? (
                <img
                  src={formData.adventureImage}
                  alt="Adventure preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium text-center">Upload adventure image</p>
                </div>
              )}
              <input
                id="adventure-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('adventureImage', file);
                }}
              />
            </div>
          </div>

          {/* Plot */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium flex items-center gap-2">
              Plot <span className="text-primary">*</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              placeholder="Describe the main plot of your adventure..."
              value={formData.plot}
              onChange={(e) => handleInputChange('plot', e.target.value)}
              className="min-h-[100px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
            />
            <p className="text-muted-foreground text-xs">{getCharacterCount(formData.plot)} characters</p>
          </div>

          {/* Introduction */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium flex items-center gap-2">
              Introduction <span className="text-primary">*</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              placeholder="Write an engaging introduction to your adventure..."
              value={formData.introduction}
              onChange={(e) => handleInputChange('introduction', e.target.value)}
              className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
            />
            <p className="text-muted-foreground text-xs">{getCharacterCount(formData.introduction)} characters</p>
          </div>

          {/* Background Image */}
          <div className="space-y-4">
            <h3 className="text-primary text-sm font-medium">Background Image</h3>
            <div
              className="w-full h-48 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
              onClick={() => document.getElementById('background-image-input')?.click()}
            >
              {formData.backgroundImage ? (
                <img
                  src={formData.backgroundImage}
                  alt="Background preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium text-center">Upload background image</p>
                </div>
              )}
              <input
                id="background-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('backgroundImage', file);
                }}
              />
            </div>
          </div>

          {/* Adventure Type Selection */}
          <div className="space-y-4">
            <h3 className="text-primary text-sm font-medium">Adventure Type</h3>
            <RadioGroup 
              value={adventureType} 
              onValueChange={(value) => setAdventureType(value as AdventureType)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 bg-secondary/30 rounded-lg p-4 border border-border">
                <RadioGroupItem value="mcp" id="mcp" className="border-primary" />
                <Label htmlFor="mcp" className="text-xs font-medium">MCP Server</Label>
              </div>
              <div className="flex items-center space-x-3 bg-secondary/30 rounded-lg p-4 border border-border">
                <RadioGroupItem value="custom" id="custom" className="border-primary text-primary" />
                <Label htmlFor="custom" className="text-xs font-medium">Custom</Label>
              </div>
            </RadioGroup>
          </div>

          {/* MCP Server Fields */}
          {adventureType === 'mcp' && (
            <>
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Source Story <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  placeholder="Name of anime, manga, manhwa, novel, or book..."
                  value={formData.sourceStory}
                  onChange={(e) => handleInputChange('sourceStory', e.target.value)}
                  className="text-xs bg-secondary/50 border-border rounded-lg h-12 placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">Enter the source material for the MCP server to reference</p>
              </div>

              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Settings <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  placeholder="e.g., One Piece in Wano, Naruto after Chunin Exams..."
                  value={formData.mcpSettings}
                  onChange={(e) => handleInputChange('mcpSettings', e.target.value)}
                  className="text-xs bg-secondary/50 border-border rounded-lg h-12 placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">Help the MCP server know which part of the story to focus on</p>
              </div>
            </>
          )}

          {/* Custom Fields */}
          {adventureType === 'custom' && (
            <>
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium">Settings</Label>
                <Textarea
                  placeholder="Custom adventure settings..."
                  value={formData.customSettings}
                  onChange={(e) => handleInputChange('customSettings', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium">AI Instructions</Label>
                <Textarea
                  placeholder="What should the AI do in this roleplay..."
                  value={formData.aiInstructions}
                  onChange={(e) => handleInputChange('aiInstructions', e.target.value)}
                  className="min-h-[100px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium">Story Summary</Label>
                <Textarea
                  placeholder="Brief summary of the story..."
                  value={formData.storySummary}
                  onChange={(e) => handleInputChange('storySummary', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium">Plot Essentials</Label>
                <Textarea
                  placeholder="Essential plot information to help AI generate responses..."
                  value={formData.plotEssentials}
                  onChange={(e) => handleInputChange('plotEssentials', e.target.value)}
                  className="min-h-[100px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>

              {/* Story Cards Section */}
              <StoryCardsSection 
                storyCards={storyCards}
                onAddCard={addStoryCard}
                onUpdateCard={updateStoryCard}
                onRemoveCard={removeStoryCard}
              />
            </>
          )}

          {/* Category */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="text-xs bg-secondary/50 border-border rounded-lg h-12">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()} className="text-xs py-3">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium">Rating</Label>
            <RadioGroup 
              value={formData.rating} 
              onValueChange={(value) => handleInputChange('rating', value)}
              className="flex flex-row gap-4"
            >
              <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3 border border-border flex-1">
                <RadioGroupItem value="all-ages" id="all-ages" className="border-primary" />
                <Label htmlFor="all-ages" className="text-xs font-medium">All ages 0+</Label>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3 border border-border flex-1">
                <RadioGroupItem value="teens" id="teens" className="border-primary" />
                <Label htmlFor="teens" className="text-xs font-medium">Teens 13+</Label>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3 border border-border flex-1">
                <RadioGroupItem value="adults" id="adults" className="border-primary" />
                <Label htmlFor="adults" className="text-xs font-medium">Adults 18+</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Persona */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium">Persona</Label>
            <Textarea
              placeholder="Who will the user play as in this story..."
              value={formData.persona}
              onChange={(e) => handleInputChange('persona', e.target.value)}
              className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <Label className="text-primary text-sm font-medium">Visibility</Label>
            <RadioGroup 
              value={formData.visibility} 
              onValueChange={(value) => handleInputChange('visibility', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="public" id="public" className="border-primary text-primary" />
                <Label htmlFor="public" className="text-xs font-medium">Public: Everyone can play</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="private" id="private" className="border-primary" />
                <Label htmlFor="private" className="text-xs font-medium">Private: Only you can play</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pb-8 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12 text-xs font-medium rounded-lg border-border"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-xs font-medium rounded-lg shadow-lg"
              disabled={isCreating || !user}
              onClick={handleSave}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Save Adventure'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAdventure;
