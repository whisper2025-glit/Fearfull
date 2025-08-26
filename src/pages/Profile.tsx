import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Settings, Gift, MoreHorizontal, X, Camera, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CharacterCard } from "@/components/CharacterCard";
import SettingsSheet from "@/components/SettingsSheet";
import { supabase, uploadImage } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('bots');
  const [sortBy, setSortBy] = useState('newest');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);

  // User profile state with Supabase data
  const [userProfile, setUserProfile] = useState({
    name: '',
    bio: '',
    gender: '',
    avatar: '',
    banner: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    likes: 0,
    publicBots: 0,
    favorites: 0,
    posts: 0
  });

  // Load user profile and data from Supabase
  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load user data from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user:', userError);
      } else if (userData) {
        setUserProfile({
          name: userData.full_name || user.firstName || user.username || 'User',
          bio: userData.bio || '',
          gender: userData.gender || '',
          avatar: userData.avatar_url || user.imageUrl || '',
          banner: userData.banner_url || ''
        });
      } else {
        // Set default values from Clerk
        setUserProfile({
          name: user.firstName || user.username || 'User',
          bio: '',
          gender: '',
          avatar: user.imageUrl || '',
          banner: ''
        });
      }

      // Load user's characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*, messages(id)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (charactersError) {
        console.error('Error loading characters:', charactersError);
      } else {
        setUserCharacters(charactersData || []);
        setStats(prev => ({
          ...prev,
          publicBots: (charactersData || []).filter(char => char.visibility === 'public').length
        }));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Filter characters based on active tab
  const getCharactersForTab = () => {
    switch (activeTab) {
      case 'bots':
        return userCharacters.filter(char => char.visibility === 'public');
      case 'favorites':
        // TODO: Implement favorites functionality
        return [];
      case 'posts':
        // TODO: Implement posts functionality
        return [];
      default:
        return [];
    }
  };

  const displayCharacters = getCharactersForTab();

  const tabs = [
    { id: 'bots', label: 'Public Bots', count: stats.publicBots },
    { id: 'favorites', label: 'Favorites', count: stats.favorites },
    { id: 'posts', label: 'Post', count: stats.posts }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'chats', label: 'Chats' },
    { id: 'likes', label: 'Likes' }
  ];

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        console.log('🖼️ Starting banner upload:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });

        // Get file extension from the uploaded file
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const bannerPath = `${user.id}/banners/${Date.now()}.${fileExtension}`;
        console.log('📁 Upload path:', bannerPath);

        const { publicUrl } = await uploadImage('profiles', bannerPath, file);
        console.log('✅ Banner uploaded successfully, URL:', publicUrl);

        setUserProfile(prev => ({ ...prev, banner: publicUrl }));
        toast.success('Banner uploaded successfully');
      } catch (error) {
        console.error('�� Error uploading banner:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error
        });
        toast.error(`Failed to upload banner: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        // Upload to Supabase storage
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const avatarPath = `${user.id}/avatars/${Date.now()}.${fileExtension}`;
        const { publicUrl } = await uploadImage('profiles', avatarPath, file);

        // Update Clerk profile image
        await user.setProfileImage({ file });

        // Update local state
        setUserProfile(prev => ({ ...prev, avatar: publicUrl }));
        toast.success('Avatar updated successfully');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Failed to update avatar');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate name length
    if (userProfile.name.length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    setIsSaving(true);
    try {
      // Note: We store the full display name in Supabase, not in Clerk's firstName
      // to avoid validation issues with Clerk's firstName field restrictions

      // First get existing user data to preserve username
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      // Generate username if none exists
      const generateUsername = (displayName: string, userId: string): string => {
        let username = displayName.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);
        if (!username) {
          username = 'user' + userId.substring(0, 8);
        }
        username += userId.substring(0, 4);
        return username;
      };

      const username = existingUser?.username ||
                      user.username ||
                      generateUsername(userProfile.name, user.id);

      // Update Supabase user
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          username: username,
          full_name: userProfile.name,
          email: user.emailAddresses?.[0]?.emailAddress || null,
          avatar_url: userProfile.avatar,
          banner_url: userProfile.banner,
          bio: userProfile.bio,
          gender: userProfile.gender,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Error updating profile:', error);
        console.error('🔍 Current userProfile state:', userProfile);
        console.error('📊 Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Provide more specific error messages
        if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
          toast.error('Authentication error. Please try logging out and back in.');
        } else {
          toast.error('Failed to save profile: ' + (error.message || 'Unknown error'));
        }
      } else {
        toast.success('Profile updated successfully');
        setEditModalOpen(false);

        // Reload user data to reflect changes
        await loadUserData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error);

      if (error instanceof Error) {
        if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
          toast.error('Authentication error. Please try logging out and back in.');
        } else {
          toast.error('Failed to save profile: ' + error.message);
        }
      } else {
        toast.error('Failed to save profile: Unknown error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const FavoriteCharacterCard = ({ character }: { character: any }) => (
    <div className="character-card group cursor-pointer w-full bg-card rounded-2xl overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Star/Bookmark Icon */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white mb-1">
            {character.name}
          </h3>
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {character.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {character.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700/80 text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading if user data is not yet available
  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        {/* Banner and Profile Section */}
        <div className="relative">
          {/* Banner */}
          <div
            className="h-64 bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center relative"
            style={userProfile.banner ? { backgroundImage: `url(${userProfile.banner})` } : {}}
          >
            {/* Dark glass overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Back button */}
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/20 hover:bg-black/40 text-white"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Overlay buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 text-white">
                <Gift className="h-5 w-5" />
              </Button>
              <SettingsSheet>
                <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 text-white">
                  <Settings className="h-5 w-5" />
                </Button>
              </SettingsSheet>
            </div>

            {/* Profile Info - Positioned at bottom of banner */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end gap-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-white">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{userProfile.name}</h1>
                  <p className="text-sm text-white/80">{userProfile.bio}</p>
                </div>
              </div>

              {/* Stats and Edit Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats.followers}</div>
                    <div className="text-xs text-white/70">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats.following}</div>
                    <div className="text-xs text-white/70">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats.likes}</div>
                    <div className="text-xs text-white/70">Likes</div>
                  </div>
                </div>

                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-700/80 hover:bg-gray-600/80 text-white px-6">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border max-w-md">
                    <DialogHeader className="flex flex-row items-center justify-between">
                      <DialogTitle>Edit Profile</DialogTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditModalOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                      {/* Avatar */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={userProfile.avatar} />
                            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Button
                            size="icon"
                            className="absolute bottom-0 right-0 w-6 h-6 bg-gray-700 hover:bg-gray-600"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            <Camera className="h-3 w-3" />
                          </Button>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <p className="text-xs text-muted-foreground">Your name as it appears on your profile and character cards</p>
                        <div className="relative">
                          <Input
                            id="name"
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            className="bg-background border-border"
                            placeholder="e.g. John Doe"
                          />
                          <span className="absolute right-3 top-3 text-xs text-muted-foreground">
                            {userProfile.name.length}/50
                          </span>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <div className="flex gap-2">
                          {['Male', 'Female', 'Non-binary'].map((gender) => (
                            <Button
                              key={gender}
                              variant={userProfile.gender === gender ? "default" : "outline"}
                              className="flex-1 text-xs"
                              onClick={() => setUserProfile({...userProfile, gender})}
                            >
                              {gender}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <div className="relative">
                          <Textarea
                            id="bio"
                            value={userProfile.bio}
                            onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                            className="bg-background border-border min-h-[80px] resize-none"
                            placeholder="Tell us about yourself..."
                          />
                          <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                            {userProfile.bio.length}/80
                          </span>
                        </div>
                      </div>

                      {/* Banner */}
                      <div className="space-y-2">
                        <Label>Banner</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-xs"
                          onClick={() => document.getElementById('banner-upload')?.click()}
                        >
                          Change Banner
                          <span>→</span>
                        </Button>
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                        />
                      </div>

                      {/* Save Button */}
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs and Sort */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-400 border-blue-400' 
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label} {tab.count}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className="text-sm"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : displayCharacters.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {displayCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={{
                    id: character.id,
                    name: character.name,
                    description: character.intro,
                    image: character.avatar_url || '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
                    category: character.tags?.[0] || 'General',
                    stats: {
                      messages: character.messages?.length || 0,
                      likes: 0 // Placeholder
                    }
                  }}
                  onClick={() => navigate(`/chat/${character.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <div className="text-2xl">💬</div>
              </div>
              <p className="text-muted-foreground text-sm">
                {activeTab === 'bots' ? 'No bot yet, try to create one.' :
                 activeTab === 'favorites' ? 'No favorites yet.' :
                 'No posts yet.'}
              </p>
              {activeTab === 'bots' && (
                <Button
                  onClick={() => navigate('/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Create my Bots
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
