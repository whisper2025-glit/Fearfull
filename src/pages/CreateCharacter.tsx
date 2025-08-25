
import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Info } from "lucide-react";
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
    gender: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              className="text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-primary font-medium text-[14px]">New Character...</h1>
              <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-medium">
                Draft
              </span>
            </div>
          </div>
          <Button variant="ghost" className="text-muted-foreground text-[12px]">
            <Info className="h-3 w-3 mr-1" />
            View Guide
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex">
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none h-12 text-[12px] ${
              activeTab === 'create' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-black text-white hover:bg-secondary'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none h-12 text-[12px] ${
              activeTab === 'preview' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-black text-white hover:bg-secondary'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {activeTab === 'create' ? (
            <>
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-primary text-[14px] font-medium flex items-center gap-1">
                    Name <span className="text-primary">*</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="name"
                    placeholder="Get your character a wonderful name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-2 text-[12px] bg-input border-border"
                  />
                  <p className="text-muted-foreground text-[12px] mt-1">0 characters</p>
                </div>

                <div>
                  <Label htmlFor="age" className="text-primary text-[14px] font-medium flex items-center gap-1">
                    Age <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="age"
                    placeholder="Enter the character's age here."
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="mt-2 text-[12px] bg-input border-border"
                  />
                  <p className="text-muted-foreground text-[12px] mt-1">0 characters</p>
                </div>
              </div>

              {/* Character Photo */}
              <div className="space-y-3">
                <h3 className="text-primary text-[14px] font-medium">Character Photo</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-[12px] mb-2">Upload your photo</p>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  <p>Avatars can be in various formats including <span className="text-green-500">webp, png, gif, and jpeg</span>, with <span className="text-green-500">webp</span> working best (gif can be converted to webp and then uploaded). It is recommended to upload a <span className="text-green-500">9:16</span> or <span className="text-green-500">3:4</span> image from which a <span className="text-green-500">1:1 (512x512)</span> avatar is captured. The image should be less than 5MB.</p>
                  <p className="text-red-500 mt-2">Please do not upload images containing underage individuals, as this may result in your OC being banned or restricted from display.</p>
                </div>
              </div>

              {/* Introduction */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Introduction <span className="text-primary">*</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-[12px]">
                  Brief Description of your character, for display. This won't influence memory or prompts. You can enter plain text or html text here. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                </p>
                <Textarea
                  placeholder="e.g. I can talk to you the whole night if you want"
                  value={formData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  className="min-h-[100px] text-[12px] bg-input border-border resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-[12px]">0 characters</p>
                  <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground">
                    AI Summarize
                  </Button>
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Visibility <span className="text-primary">*</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <RadioGroup 
                  value={formData.visibility} 
                  onValueChange={(value) => handleInputChange('visibility', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="text-[12px]">Public: Everyone can chat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unlisted" id="unlisted" />
                    <Label htmlFor="unlisted" className="text-[12px]">Unlisted: Anyone with the link can chat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="text-[12px]">Private: Only you can chat</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Rating <span className="text-primary">*</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <RadioGroup 
                  value={formData.rating} 
                  onValueChange={(value) => handleInputChange('rating', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="filtered" id="filtered" />
                    <Label htmlFor="filtered" className="text-[12px]">Filtered</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unfiltered" id="unfiltered" />
                    <Label htmlFor="unfiltered" className="text-[12px]">Unfiltered</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Tags <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select>
                  <SelectTrigger className="text-[12px] bg-input border-border">
                    <SelectValue placeholder="Select tags..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium">
                  Gender <span className="text-primary">*</span>
                </Label>
                <Select 
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="text-[12px] bg-input border-border">
                    <SelectValue placeholder="Choose gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appearance */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Appearance <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-[12px]">
                  Describe {'{char}'}'s appearance here. This content will be saved in the long-term context. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                </p>
                <Textarea
                  placeholder="e.g.{{char}} has long, wavy brown hair, bright green eyes, and a warm smile. {{char}}'s skin is fair with a natural glow, and {{char}}'s features are delicate, with a slender frame and a graceful, confident posture."
                  value={formData.appearance}
                  onChange={(e) => handleInputChange('appearance', e.target.value)}
                  className="min-h-[100px] text-[12px] bg-input border-border resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-[12px]">0 Chars</p>
                  <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground">
                    AI Summarize
                  </Button>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Personality <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-[12px]">
                  The detailed description of your character. This will be included in long-term memory. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                </p>
                <Textarea
                  placeholder="The Long Description allows you to have the Character describe themselves (traits, history, mannerisms, etc) and the kinds of things they want to talk about."
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  className="min-h-[120px] text-[12px] bg-input border-border resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-[12px]">0 Chars</p>
                  <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground">
                    AI Summarize
                  </Button>
                </div>
              </div>

              {/* Scenario */}
              <div className="space-y-3">
                <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                  Scenario <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-[12px]">
                  If the switch is turned on in the chat settings, this content will be included as long-term memory. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                </p>
                <Textarea
                  placeholder="Describe the environment the Character is in."
                  value={formData.scenario}
                  onChange={(e) => handleInputChange('scenario', e.target.value)}
                  className="min-h-[100px] text-[12px] bg-input border-border resize-none"
                />
              </div>

              {/* Character Definition */}
              <div className="space-y-3">
                <h3 className="text-primary text-[14px] font-medium">Character Definition</h3>
                
                <div>
                  <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                    Public definition <span className="text-primary">*</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <RadioGroup 
                    value={formData.publicDefinition} 
                    onValueChange={(value) => handleInputChange('publicDefinition', value)}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="text-[12px]">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="text-[12px]">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-primary text-[14px] font-medium flex items-center gap-1">
                    Greeting <span className="text-primary">*</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <p className="text-muted-foreground text-[12px] mt-1 mb-2">
                    The first message your character sends. This will only be included in short-term memory. <a href="#" className="text-blue-400 underline">View the guide book.</a>
                  </p>
                  <Textarea
                    placeholder="e.g. Hello {{user}}, how are you today?"
                    value={formData.greeting}
                    onChange={(e) => handleInputChange('greeting', e.target.value)}
                    className="min-h-[100px] text-[12px] bg-input border-border resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-muted-foreground text-[12px]">0 Chars</p>
                    <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground">
                      AI Summarize
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scene Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-primary text-[14px] font-medium">Scene Card</h3>
                  <span className="bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] font-medium">New</span>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-[12px] mb-2">Upload Scene Image</p>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  <p>For clarity, it is recommended that you upload a picture of <span className="text-green-500">3072*2048, 1920*1080</span> size, less than 5MB. It will be a scene when chatting. The rectangular part in the crop is the area you display on the mobile phone.</p>
                </div>
              </div>
            </>
          ) : (
            /* Preview Tab Content */
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-[14px] font-medium">{formData.name || "Your OC's Name"}</h2>
              <div className="border-t border-border pt-4">
                <h3 className="text-[14px] font-medium mb-2">Intro</h3>
                <p className="text-[12px] text-muted-foreground">
                  {formData.intro || "Your OC's introduction"}
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-[14px] font-medium mb-2">{formData.name || "Your OC's Name"}</h3>
                <div className="bg-muted rounded-lg p-4 text-left">
                  <p className="text-[12px] text-muted-foreground">
                    {formData.greeting || "Please fill in the greetings column on the left"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="pb-6">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-[12px] font-medium rounded-full"
              onClick={() => navigate('/')}
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
