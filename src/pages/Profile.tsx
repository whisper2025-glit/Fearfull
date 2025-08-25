import { useState } from "react";
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
import { ChevronLeft, Settings, Gift, MoreHorizontal, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bots');
  const [sortBy, setSortBy] = useState('newest');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Leon',
    bio: '17 years old',
    gender: 'Male',
    avatar: '/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop'
  });

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile({...userProfile, banner: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile({...userProfile, avatar: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = {
    followers: 0,
    following: 1,
    likes: 0,
    publicBots: 0,
    favorites: 4,
    posts: 0
  };

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

  const handleSaveProfile = () => {
    setEditModalOpen(false);
    // Handle save logic here
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Gift className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Banner and Profile Section */}
        <div className="relative">
          {/* Banner */}
          <div
            className="h-48 bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center"
            style={userProfile.banner ? { backgroundImage: `url(${userProfile.banner})` } : {}}
          />
          
          {/* Profile Info */}
          <div className="px-4 pb-4">
            <div className="flex items-end gap-4 -mt-8">
              <Avatar className="w-16 h-16 border-4 border-background">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-8">
                <h1 className="text-xl font-bold text-foreground">{userProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{stats.following}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{stats.likes}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
              
              <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-auto bg-gray-700 hover:bg-gray-600 text-white px-6">
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
                      <div className="relative">
                        <Input 
                          id="name"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          className="bg-background border-border"
                        />
                        <span className="absolute right-3 top-3 text-xs text-muted-foreground">
                          {userProfile.name.length}/20
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <div className="text-2xl">💬</div>
            </div>
            <p className="text-muted-foreground text-sm">No bot yet, try to create one.</p>
            <Button 
              onClick={() => navigate('/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Create my Bots
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
