import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Upload, Info, ChevronUp, Heart, RotateCcw, Loader2, ChevronDown, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase, uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageFormatter } from "@/components/MessageFormatter";

const EditCharacter = () => {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    intro: '',
    appearance: '',
    personality: '',
    scenario: '',
    greeting: '',
    visibility: 'public',
    rating: 'filtered',
    tags: [] as string[],
    gender: '',
    characterImage: '',
    sceneImage: ''
  });

  const [isTagsSheetOpen, setIsTagsSheetOpen] = useState(false);

  const HOME_TAGS = [
    'For You',
    'Anime',
    'Romance',
    'OC',
    'RPG',
    'Furry',
    'Game Characters',
    'BL & ABO',
    'Movie & TV',
    'Helpers',
    'VTuber',
    'Cartoon',
    'Interactive story',
    'Ai-Roleplay',
  ];

  // Load character data
  useEffect(() => {
    const loadCharacterData = async () => {
      if (!characterId || !user) return;

      setIsLoading(true);
      try {
        const { data: characterData, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .eq('owner_id', user.id) // Ensure user owns this character
          .single();

        if (error) {
          console.error('Error loading character:', error);
          toast.error('Character not found or you do not have permission to edit it');
          navigate('/profile');
          return;
        }

        if (characterData) {
          setFormData({
            name: characterData.name || '',
            age: characterData.age || '',
            intro: characterData.intro || '',
            appearance: characterData.appearance || '',
            personality: characterData.personality || '',
            scenario: characterData.scenario || '',
            greeting: characterData.greeting || '',
            visibility: characterData.visibility || 'public',
            rating: characterData.rating || 'filtered',
            tags: characterData.tags || [],
            gender: characterData.gender || '',
            characterImage: characterData.avatar_url || '',
            sceneImage: characterData.scene_url || ''
          });
        }
      } catch (error) {
        console.error('Error loading character:', error);
        toast.error('Failed to load character data');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacterData();
  }, [characterId, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'characterImage' | 'sceneImage', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const handleSave = async () => {
    if (!user || !characterId || !formData.name || !formData.intro) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl = formData.characterImage;
      let sceneUrl = formData.sceneImage;

      // Upload character image if it's a new data URL
      if (formData.characterImage && formData.characterImage.startsWith('data:')) {
        try {
          const response = await fetch(formData.characterImage);
          const blob = await response.blob();
          const file = new File([blob], 'character-avatar.jpg', { type: blob.type });

          const avatarPath = `${user.id}/avatars/${Date.now()}.jpg`;
          const { publicUrl } = await uploadImage('avatars', avatarPath, file);
          avatarUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading character image:', error);
          toast.error('Failed to upload character image');
        }
      }

      // Upload scene image if it's a new data URL
      if (formData.sceneImage && formData.sceneImage.startsWith('data:')) {
        try {
          const response = await fetch(formData.sceneImage);
          const blob = await response.blob();
          const file = new File([blob], 'scene-background.jpg', { type: blob.type });

          const scenePath = `${user.id}/scenes/${Date.now()}.jpg`;
          const { publicUrl } = await uploadImage('scenes', scenePath, file);
          sceneUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading scene image:', error);
          toast.error('Failed to upload scene image');
        }
      }

      // Update character in Supabase
      const { error } = await supabase
        .from('characters')
        .update({
          name: formData.name,
          intro: formData.intro,
          scenario: formData.scenario || null,
          greeting: formData.greeting || null,
          personality: formData.personality || null,
          appearance: formData.appearance || null,
          avatar_url: avatarUrl || null,
          scene_url: sceneUrl || null,
          visibility: formData.visibility as 'public' | 'unlisted' | 'private',
          rating: formData.rating as 'filtered' | 'unfiltered',
          tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
          gender: formData.gender || null,
          age: formData.age || null
        })
        .eq('id', characterId)
        .eq('owner_id', user.id); // Ensure user owns this character

      if (error) {
        console.error('Error updating character:', error);
        toast.error('Failed to update character');
        return;
      }

      toast.success('Character updated successfully!');
      navigate(`/character/${characterId}`);
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout headerPosition="fixed">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading character...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerPosition="fixed">
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
              <h1 className="text-primary font-medium text-sm">Edit Character: {formData.name}</h1>
            </div>
          </div>
          
          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.name || !formData.intro}
            className="bg-primary hover:bg-primary/90 text-white px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-background">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none h-12 text-xs font-medium ${
              activeTab === 'edit'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-black text-white hover:bg-secondary/30'
            }`}
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none h-12 text-xs font-medium ${
              activeTab === 'preview'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-black text-white hover:bg-secondary/30'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
          {activeTab === 'edit' ? (
            <>
              {/* All the same form fields as CreateCharacter but with edit functionality */}
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-primary text-sm font-medium flex items-center gap-2">
                  Name <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  id="name"
                  placeholder="Get your character a wonderful name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-xs bg-secondary/50 border-border rounded-lg h-12 placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.name)} characters</p>
              </div>

              {/* Introduction */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Introduction <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Brief Description of your character, for display. You can use markdown images with <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code>.
                </p>
                <Textarea
                  placeholder="e.g. I can talk to you the whole night if you want"
                  value={formData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.intro)} characters</p>
              </div>

              {/* Greeting */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Greeting <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The first message your character sends. Use markdown images with <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code> and actions with <code className="bg-muted px-1 py-0.5 rounded">*action*</code>.
                </p>
                <Textarea
                  placeholder="e.g. Hello {{user}}, how are you today?"
                  value={formData.greeting}
                  onChange={(e) => handleInputChange('greeting', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.greeting)} Chars</p>
              </div>
            </>
          ) : (
            /* Preview Tab Content */
            <div className="text-center py-12 space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center overflow-hidden">
                {formData.characterImage ? (
                  <img src={formData.characterImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <h2 className="text-sm font-medium">{formData.name || "Character Name"}</h2>
              
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-3">Intro</h3>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <MessageFormatter 
                    content={formData.intro || "Character introduction"} 
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-3">Greeting</h3>
                <div className="bg-secondary/50 rounded-lg p-4 text-left">
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <MessageFormatter 
                      content={formData.greeting || "Character greeting message"} 
                      className="text-xs leading-relaxed chat-text"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditCharacter;
