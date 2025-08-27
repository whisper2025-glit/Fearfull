import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, MessageCircle, Heart, User, ChevronLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { CommentsList } from "./CommentsList";
import { toast } from "sonner";

const HERO_IMAGE = "https://cdn.builder.io/api/v1/image/assets%2F420adf53974e411387df983f01823d73%2F4635cc3157e045f592ade58eeea4af3b?format=webp&width=800";

export function BotProfileSheet() {
  const [scrollY, setScrollY] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // Calculate header opacity based on when content actually reaches the top
  // Content starts at 65vh, so header should only activate when content approaches top
  const contentStart = window.innerHeight * 0.65; // 65vh in pixels
  const headerActivationPoint = contentStart - 100; // Start activation 100px before content reaches top

  const headerOpacity = Math.min(Math.max(scrollY - headerActivationPoint, 0) / 150, 1);
  const titleOpacity = Math.min(Math.max(scrollY - headerActivationPoint - 50, 0) / 100, 1);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <User className="mr-2 h-4 w-4" />
          Bot Profile
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#111216] text-white h-screen border-0">
        <div className="relative h-full overflow-hidden">
          {/* Character Image Background - Fixed */}
          <div className="fixed inset-0 z-0">
            <img src={HERO_IMAGE} alt="Character" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/60 to-transparent" />
          </div>

          {/* Scrollable Header - appears on scroll */}
          <div
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: `rgba(17, 18, 22, ${headerOpacity})`,
              backdropFilter: headerOpacity > 0.5 ? 'blur(10px)' : 'none',
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-white"
                  style={{
                    backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2
                  className="text-lg font-semibold text-white transition-opacity duration-300"
                  style={{ opacity: titleOpacity }}
                >
                  Cata | Curious Innocent Alien
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white"
                style={{
                  backgroundColor: headerOpacity > 0.3 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Initial Top Navigation - visible when not scrolled */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 transition-opacity duration-300"
            style={{ opacity: 1 - headerOpacity }}
          >
            <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/20 backdrop-blur-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/20 backdrop-blur-sm">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div
            className="relative z-10 h-full overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="h-[40vh]"></div>
            
            {/* Character Info Section */}
            <div className="bg-[#111216] p-4 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Cata | Curious Innocent Alien</h1>
                <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
                  <span>@Venom Master</span>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>59.6K</span>
                  </div>
                  <span>1008 tokens</span>
                </div>
              </div>
              
              {/* Start Chat Button */}
              <div className="w-full">
                <div className="w-full rounded-full p-[1px] bg-gradient-to-r from-pink-500 to-cyan-400">
                  <Button className="w-full rounded-full bg-black/40 hover:bg-black/60 text-white text-base py-3">
                    Start Chat
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-transparent p-0 h-auto w-full justify-start">
                  <TabsTrigger
                    value="details"
                    className="text-white data-[state=active]:text-pink-400 data-[state=active]:bg-transparent bg-transparent border-b-2 border-transparent data-[state=active]:border-pink-400 rounded-none px-0 mr-6"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="text-white/60 data-[state=active]:text-pink-400 data-[state=active]:bg-transparent bg-transparent border-b-2 border-transparent data-[state=active]:border-pink-400 rounded-none px-0"
                  >
                    Comments (0)
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4 space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {['AnyPOV', 'Fantasy', 'Sci-Fi'].map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`${index === 0 ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-white/10 text-white/70 border-white/20'} text-xs px-2 py-1 rounded-full`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">[Cute, Alien, Oblivious]</h3>
                    <div className="space-y-2">
                      <div className={`text-white/80 text-sm leading-relaxed transition-all duration-300 ${
                        isDescriptionExpanded ? 'max-h-none' : 'max-h-16 overflow-hidden'
                      }`}>
                        <p className="text-white/80 text-sm leading-relaxed">
                          While investigating strange lights in the woods, you come across a cute alien woman who is fascinated by Earth but knows very little about it. She has bright, curious eyes and an innocent demeanor that makes her endearing to humans. Despite her advanced alien technology and abilities, she approaches every earthly experience with wonder and excitement, often asking many questions about the simplest things.
                        </p>
                      </div>

                      {/* View More/Less Button */}
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-pink-400 text-sm font-medium flex items-center gap-1 hover:text-pink-300 transition-colors"
                      >
                        {isDescriptionExpanded ? 'View Less' : 'View More'}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <div className="bg-[#1a1a1a] rounded-lg border border-white/10 max-h-[300px]">
                    <CommentsList
                      onAddComment={async (content) => {
                        console.log('Adding comment:', content);
                        // TODO: Implement comment submission to Supabase
                        toast.success('Comment added!');
                      }}
                      onLikeComment={(commentId) => {
                        console.log('Liking comment:', commentId);
                        // TODO: Implement comment liking
                      }}
                      onReplyToComment={(commentId) => {
                        console.log('Replying to comment:', commentId);
                        // TODO: Implement comment replies
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
