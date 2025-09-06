import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Upload, Info, ChevronUp, RotateCcw, Loader2, ChevronDown, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase, uploadImage } from "@/lib/supabase";
import { compressAndCropImage } from "@/lib/image";
import { toast } from "sonner";
import { MessageFormatter } from "@/components/MessageFormatter";
import { Card } from "@/components/ui/card";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

const CreateCharacter = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');
  const [isCreating, setIsCreating] = useState(false);
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
  useHistoryBackClose(isTagsSheetOpen, setIsTagsSheetOpen, "create-tags");

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field: 'characterImage' | 'sceneImage', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    try {
      const { dataUrl } = await compressAndCropImage(file, {
        maxDimension: field === 'characterImage' ? 512 : 1920,
        quality: 0.9,
        outputType: 'image/webp',
        squareCrop: field === 'characterImage',
      });
      setFormData(prev => ({ ...prev, [field]: dataUrl }));
    } catch (e) {
      toast.error('Failed to process image');
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  return (
    <Layout headerPosition="fixed">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
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
              <h1 className="text-primary font-medium text-sm">New Character...</h1>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center bg-background py-3">
          <div className="inline-flex items-center gap-1 bg-black rounded-full p-1">
            <Button
              variant="ghost"
              className={`rounded-full h-9 px-6 text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-primary text-white shadow'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Create
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full h-9 px-6 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-primary text-white shadow'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
          {activeTab === 'create' ? (
            <>
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

              {/* Age Field */}
              <div className="space-y-3">
                <Label htmlFor="age" className="text-primary text-sm font-medium">
                  Age <span className="text-primary">*</span>
                </Label>
                <Input
                  id="age"
                  placeholder="Enter the character's age here."
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="text-xs bg-secondary/50 border-border rounded-lg h-12 placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.age)} characters</p>
              </div>

              {/* Character Photo */}
              <div className="space-y-4">
                <h3 className="text-primary text-sm font-medium">Character Photo</h3>
                <div className="flex items-end gap-4">
                  <div
                    className="w-52 h-80 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
                    onClick={() => document.getElementById('character-image-input')?.click()}
                  >
                    {formData.characterImage ? (
                      <img
                        src={formData.characterImage}
                        alt="Character preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-xs font-medium text-center">Upload your photo</p>
                      </div>
                    )}
                    <input
                      id="character-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleImageUpload('characterImage', file);
                      }}
                    />
                  </div>
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center relative overflow-hidden">
                    {formData.characterImage ? (
                      <img
                        src={formData.characterImage}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Avatars can be in various formats including <span className="text-green-400">webp</span>,
                    <span className="text-green-400"> png, gif, and jpeg</span>, with <span className="text-green-400">webp</span> working
                    best (gif can be converted to webp and then uploaded). It is recommended to upload a
                    <span className="text-green-400"> 9:16</span> or <span className="text-green-400">3:4</span> image from
                    which a <span className="text-green-400">1:1 (512x512)</span> avatar is captured. The image should be less than 5MB.
                  </p>
                  <p className="text-red-400 text-xs leading-relaxed">
                    Please do not upload images containing underage individuals, as this may result in your OC
                    being banned or restricted from display.
                  </p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-full font-medium">
                  Change
                </Button>
              </div>

              {/* Scene Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-primary text-sm font-medium">Scene Card</h3>
                  <span className="bg-cyan-400 text-black px-2 py-1 rounded-full text-xs font-bold">New</span>
                  <ChevronUp className="h-4 w-4 text-primary ml-auto" />
                </div>
                <div
                  className="w-full h-48 relative bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
                  onClick={() => document.getElementById('scene-image-input')?.click()}
                >
                  {formData.sceneImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.sceneImage}
                        alt="Scene preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <p className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">Scene Background</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">Upload Scene Image</p>
                    </div>
                  )}
                  <input
                    id="scene-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleImageUpload('sceneImage', file);
                    }}
                  />
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    For clarity, it is recommended that you upload a picture of 
                    <span className="text-green-400"> 3072*2048, 1920*1080</span> size, less than 5MB. It will 
                    be a scene when chatting. The rectangular part in the crop is the area you display on the mobile phone.
                  </p>
                </div>
              </div>

              {/* Introduction */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Introduction <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Brief Description of your character, for display. This won't influence memory or prompts. You can enter
                  plain text, HTML, or use markdown image syntax like <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code>.
                </p>
                <Textarea
                  placeholder="e.g. I can talk to you the whole night if you want"
                  value={formData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.intro)} characters</p>
              </div>

              {/* Visibility */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Visibility <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <RadioGroup 
                  value={formData.visibility} 
                  onValueChange={(value) => handleInputChange('visibility', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="public" id="public" className="border-primary text-primary" />
                    <Label htmlFor="public" className="text-xs font-medium">Public: Everyone can chat</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="unlisted" id="unlisted" className="border-primary" />
                    <Label htmlFor="unlisted" className="text-xs font-medium">Unlisted: Anyone with the link can chat</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="private" id="private" className="border-primary" />
                    <Label htmlFor="private" className="text-xs font-medium">Private: Only you can chat</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rating */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Rating <span className="text-primary">*</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <RadioGroup 
                  value={formData.rating} 
                  onValueChange={(value) => handleInputChange('rating', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="filtered" id="filtered" className="border-primary text-primary" />
                    <Label htmlFor="filtered" className="text-xs font-medium">Filtered</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="unfiltered" id="unfiltered" className="border-primary" />
                    <Label htmlFor="unfiltered" className="text-xs font-medium">Unfiltered</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Tags <Info className="h-4 w-4 text-muted-foreground" />
                </Label>

                {/* Selected tags preview */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Sheet open={isTagsSheetOpen} onOpenChange={setIsTagsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs w-full justify-between"
                    >
                      {formData.tags.length > 0 ? `${formData.tags.length} tag(s) selected` : 'Select tags'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[70vh]">
                    <SheetHeader>
                      <SheetTitle className="text-sm">Select Tags</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {HOME_TAGS.filter(t => t !== 'For You').map((tag) => {
                          const selected = formData.tags.includes(tag);
                          return (
                            <Badge
                              key={tag}
                              variant={selected ? 'default' : 'secondary'}
                              className={`cursor-pointer text-xs ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags.includes(tag)
                                    ? prev.tags.filter((t: string) => t !== tag)
                                    : [...prev.tags, tag]
                                }));
                              }}
                            >
                              {tag}
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" className="text-xs" onClick={() => setIsTagsSheetOpen(false)}>
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setFormData(prev => ({ ...prev, tags: [] }))}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Gender */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium">
                  Gender <span className="text-primary">*</span>
                </Label>
                <Select 
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="text-xs bg-secondary/50 border-border rounded-lg h-12">
                    <SelectValue placeholder="Choose gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-border">
                    <SelectItem value="male" className="text-xs py-3">Male</SelectItem>
                    <SelectItem value="female" className="text-xs py-3">Female</SelectItem>
                    <SelectItem value="non-binary" className="text-xs py-3">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Character Definition Section */}
              <div className="space-y-6">
                <h3 className="text-primary text-sm font-medium">Character Definition</h3>
                

                {/* Greeting */}
                <div className="space-y-4">
                  <Label className="text-primary text-sm font-medium flex items-center gap-2">
                    Greeting <span className="text-primary">*</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The first message your character sends. This will only be included in short-term memory.
                    You can use markdown images with <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code> and actions with <code className="bg-muted px-1 py-0.5 rounded">*action*</code>.
                  </p>
                  <Textarea
                    placeholder="e.g. Hello {{user}}, how are you today?"
                    value={formData.greeting}
                    onChange={(e) => handleInputChange('greeting', e.target.value)}
                    className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                  />
                  <p className="text-muted-foreground text-xs">{getCharacterCount(formData.greeting)} Chars</p>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Personality <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The detailed description of your character. This will be included in long-term memory.
                  You can include reference images using <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code>.
                </p>
                <Textarea
                  placeholder="The Long Description allows you to have the Character describe themselves (traits, history, mannerisms, etc) and the kinds of things they want to talk about."
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  className="min-h-[100px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.personality)} Chars</p>
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Appearance <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Describe {'{char}'}'s appearance here. This content will be saved in the long-term context.
                  Add reference images with <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code>.
                </p>
                <Textarea
                  placeholder="e.g.{{char}} has long, wavy brown hair, bright green eyes, and a warm smile. {{char}}'s skin is fair with a natural glow, and {{char}}'s features are delicate, with a slender frame and a graceful, confident posture."
                  value={formData.appearance}
                  onChange={(e) => handleInputChange('appearance', e.target.value)}
                  className="min-h-[100px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <p className="text-muted-foreground text-xs">{getCharacterCount(formData.appearance)} Chars</p>
              </div>

              {/* Scenario */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Scenario <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  If the switch is turned on in the chat settings, this content will be included as long-term memory.
                  Include scene images with <code className="bg-muted px-1 py-0.5 rounded">![alt text](image_url)</code>.
                </p>
                <Textarea
                  placeholder="Describe the environment the Character is in."
                  value={formData.scenario}
                  onChange={(e) => handleInputChange('scenario', e.target.value)}
                  className="min-h-[80px] text-sm bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>
            </>
          ) : (
            // Simple Chat Preview
            <div className="space-y-4 relative">
              {formData.sceneImage && (
                <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${formData.sceneImage})` }} />
              )}
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {formData.characterImage && (
                    <img src={formData.characterImage} alt="avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{formData.name || "Your OC's Name"}</h2>
                  <p className="text-xs text-muted-foreground">Preview chat</p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {/* Bot greeting */}
                <Card className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {formData.characterImage && (
                        <img src={formData.characterImage} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <MessageFormatter
                        content={formData.greeting || "Please fill in the greetings column on the left"}
                        className="chat-text"
                      />
                    </div>
                  </div>
                </Card>

                {/* Optional intro as system info */}
                {formData.intro && (
                  <Card className="p-3 bg-secondary/50">
                    <div className="text-xs text-muted-foreground">
                      <MessageFormatter content={formData.intro} className="chat-text" />
                    </div>
                  </Card>
                )}

                {/* Sample user reply */}
                <div className="flex justify-end">
                  <Card className="p-3 bg-primary text-primary-foreground max-w-[80%]">
                    <div className="text-xs chat-text">Hi!</div>
                  </Card>
                </div>
              </div>

              {/* Input (disabled) */}
              <div className="flex items-end gap-2">
                <Textarea
                  disabled
                  placeholder="Type a message (preview only)"
                  className="flex-1 resize-none min-h-[44px] bg-secondary/50 border-border text-sm"
                  rows={1}
                />
                <Button disabled size="icon" className="h-10 w-10">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="pb-8 pt-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-xs font-medium rounded-full shadow-lg"
              disabled={isCreating || !user}
              onClick={async () => {
                // Basic validation
                if (!user) {
                  toast.error('Please sign in');
                  return;
                }
                if (!formData.name || formData.name.trim().length < 2) {
                  toast.error('Name must be at least 2 characters');
                  return;
                }
                if (!formData.intro || formData.intro.trim().length < 10) {
                  toast.error('Intro must be at least 10 characters');
                  return;
                }
                if (formData.age && !/^\d+$/.test(formData.age.trim())) {
                  toast.error('Age must be a number');
                  return;
                }

                setIsCreating(true);
                try {
                  let avatarUrl = null;
                  let sceneUrl = null;

                  // Upload character image if provided
                  if (formData.characterImage) {
                    try {
                      // Convert data URL to File
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

                  // Upload scene image if provided
                  if (formData.sceneImage) {
                    try {
                      // Convert data URL to File
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

                  // Create character in Supabase
                  const { data: characterData, error } = await supabase
                    .from('characters')
                    .insert({
                      owner_id: user.id,
                      name: formData.name,
                      intro: formData.intro,
                      scenario: formData.scenario || null,
                      greeting: formData.greeting || null,
                      personality: formData.personality || null,
                      appearance: formData.appearance || null,
                      avatar_url: avatarUrl,
                      scene_url: sceneUrl,
                      visibility: formData.visibility as 'public' | 'unlisted' | 'private',
                      rating: formData.rating as 'filtered' | 'unfiltered',
                      tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
                      gender: formData.gender || null,
                      age: formData.age || null
                    })
                    .select()
                    .single();

                  if (error) {
                    console.error('Error creating character:', error);
                    toast.error('Failed to create character');
                    return;
                  }

                  // Share link behavior for unlisted
                  if (formData.visibility === 'unlisted') {
                    const shareUrl = `${window.location.origin}/character/${characterData.id}`;
                    try { await navigator.clipboard.writeText(shareUrl); } catch {}
                    toast.success('Unlisted link copied. You can share it now.');
                    navigate(`/profile?tab=unlisted`);
                  } else {
                    toast.success('Character created successfully!');
                    navigate(`/chat/${characterData.id}`);
                  }
                } catch (error) {
                  console.error('Error creating character:', error);
                  toast.error('Failed to create character');
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create and Chat!'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCharacter;
