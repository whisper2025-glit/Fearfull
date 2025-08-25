import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Info, ChevronUp, Heart, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    intro: '',
    appearance: '',
    personality: '',
    scenario: '',
    greeting: '',
    publicDefinition: 'no',
    visibility: 'public',
    rating: 'filtered',
    tags: '',
    gender: '',
    characterImage: '',
    sceneImage: ''
  });

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
              <h1 className="text-primary font-medium text-sm">New Character...</h1>
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

        {/* Tab Navigation */}
        <div className="flex bg-background">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none h-12 text-xs font-medium ${
              activeTab === 'create'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-black text-white hover:bg-secondary/30'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('characterImage', file);
                      }}
                    />
                  </div>
                  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                    {formData.characterImage ? (
                      <img
                        src={formData.characterImage}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Heart className="h-12 w-12 text-primary fill-primary" />
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 text-white" />
                    </div>
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('sceneImage', file);
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
                  plain text or html text here. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                </p>
                <Textarea
                  placeholder="e.g. I can talk to you the whole night if you want"
                  value={formData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  className="min-h-[120px] text-xs bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-xs">{getCharacterCount(formData.intro)} characters</p>
                  <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:bg-secondary/50 rounded-lg px-3 py-1">
                    ⭐ AI Summarize
                  </Button>
                </div>
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
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Tags <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <div className="relative">
                  <Select>
                    <SelectTrigger className="text-xs bg-secondary/50 border-border rounded-lg h-12">
                      <SelectValue placeholder="Select tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronUp className="h-4 w-4 text-primary rotate-180" />
                  </div>
                </div>
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
                
                {/* Public Definition */}
                <div className="space-y-4">
                  <Label className="text-primary text-sm font-medium flex items-center gap-2">
                    Public definition <span className="text-primary">*</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <RadioGroup 
                    value={formData.publicDefinition} 
                    onValueChange={(value) => handleInputChange('publicDefinition', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="yes" className="border-primary" />
                      <Label htmlFor="yes" className="text-xs font-medium">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="no" className="border-primary text-primary" />
                      <Label htmlFor="no" className="text-xs font-medium">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Greeting */}
                <div className="space-y-4">
                  <Label className="text-primary text-sm font-medium flex items-center gap-2">
                    Greeting <span className="text-primary">*</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The first message your character sends. This will only be included in short-term memory. 
                    <a href="#" className="text-blue-400 underline"> View the guide book.</a>
                  </p>
                  <Textarea
                    placeholder="e.g. Hello {{user}}, how are you today?"
                    value={formData.greeting}
                    onChange={(e) => handleInputChange('greeting', e.target.value)}
                    className="min-h-[120px] text-xs bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground text-xs">{getCharacterCount(formData.greeting)} Chars</p>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-secondary/50 rounded-lg px-3 py-1">
                      ⭐ AI Summarize
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Personality <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The detailed description of your character. This will be included in long-term memory. 
                  <a href="#" className="text-blue-400 underline"> View the guide book.</a>
                </p>
                <Textarea
                  placeholder="The Long Description allows you to have the Character describe themselves (traits, history, mannerisms, etc) and the kinds of things they want to talk about."
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  className="min-h-[140px] text-xs bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-xs">{getCharacterCount(formData.personality)} Chars</p>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-secondary/50 rounded-lg px-3 py-1">
                    ⭐ AI Summarize
                  </Button>
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Appearance <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Describe {'{char}'}'s appearance here. This content will be saved in the long-term context. 
                  <a href="#" className="text-blue-400 underline"> View the guide book.</a>
                </p>
                <Textarea
                  placeholder="e.g.{{char}} has long, wavy brown hair, bright green eyes, and a warm smile. {{char}}'s skin is fair with a natural glow, and {{char}}'s features are delicate, with a slender frame and a graceful, confident posture."
                  value={formData.appearance}
                  onChange={(e) => handleInputChange('appearance', e.target.value)}
                  className="min-h-[140px] text-xs bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-xs">{getCharacterCount(formData.appearance)} Chars</p>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-secondary/50 rounded-lg px-3 py-1">
                    ⭐ AI Summarize
                  </Button>
                </div>
              </div>

              {/* Scenario */}
              <div className="space-y-4">
                <Label className="text-primary text-sm font-medium flex items-center gap-2">
                  Scenario <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  If the switch is turned on in the chat settings, this content will be included as long-term memory. 
                  <a href="#" className="text-blue-400 underline"> View the guide book.</a>
                </p>
                <Textarea
                  placeholder="Describe the environment the Character is in."
                  value={formData.scenario}
                  onChange={(e) => handleInputChange('scenario', e.target.value)}
                  className="min-h-[120px] text-xs bg-secondary/50 border-border rounded-lg resize-none placeholder:text-muted-foreground/70"
                />
              </div>
            </>
          ) : (
            /* Preview Tab Content */
            <div className="text-center py-12 space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-sm font-medium">{formData.name || "Your OC's Name"}</h2>
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-3">Intro</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formData.intro || "Your OC's introduction"}
                </p>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-3">{formData.name || "Your OC's Name"}</h3>
                <div className="bg-secondary/50 rounded-lg p-4 text-left">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.greeting || "Please fill in the greetings column on the left"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="pb-8 pt-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-xs font-medium rounded-full shadow-lg"
              onClick={() => {
                // Save character data to localStorage
                const characterData = {
                  ...formData,
                  id: Date.now().toString(),
                  createdAt: new Date().toISOString()
                };
                localStorage.setItem('current-character', JSON.stringify(characterData));
                localStorage.setItem('scene-background', formData.sceneImage);

                // Navigate to chat with the new character
                navigate(`/chat/${characterData.id}`);
              }}
            >
              Create and Chat!
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCharacter;
