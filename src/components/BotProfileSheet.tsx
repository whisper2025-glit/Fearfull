import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, MessageCircle, Heart, Send, ThumbsUp, ThumbsDown, Clock, User, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_IMAGE = "https://cdn.builder.io/api/v1/image/assets%2F420adf53974e411387df983f01823d73%2F4635cc3157e045f592ade58eeea4af3b?format=webp&width=800";

export function BotProfileSheet() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // Calculate header opacity based on scroll position
  const maxScroll = 300; // Adjust this value to control when overlay is fully visible
  const headerOpacity = Math.min(scrollY / maxScroll, 1);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <User className="mr-2 h-4 w-4" />
          Bot Profile
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#111216] text-white text-xs h-screen border-0">
        <div className="relative h-full overflow-hidden">
          {/* Fixed Top Navigation - Always Visible */}
          <div className="absolute top-4 left-4 right-4 z-50">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white" aria-label="Back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-white/20 text-white bg-black/20 backdrop-blur-sm hover:bg-white/10" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div
            className="overflow-y-auto h-full scroll-smooth"
            onScroll={handleScroll}
          >
            {/* Hero Image with overlayed info */}
            <div className="relative w-full h-[100vh]">
              {/* Fixed character image that doesn't move */}
              <div className="fixed top-0 left-0 right-0 bottom-0 z-0">
                <img src={HERO_IMAGE} alt="Character" className="h-full w-full object-cover" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/60 to-transparent z-10" />

              {/* Character info overlay at bottom - Fixed position */}
              <div
                className="fixed inset-x-4 bottom-4 z-40 space-y-3"
                style={{
                  paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                  pointerEvents: 'auto'
                }}
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white truncate">Cata | Curious Innocent Alien</h2>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/80">@Venom Master</div>
                    <div className="flex items-center gap-4 text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>59.6K</span>
                      </div>
                      <span>1008 tokens</span>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-full p-[1px] bg-gradient-to-r from-pink-500 to-cyan-400">
                  <Button className="w-full rounded-full bg-[#00000033] hover:bg-[#00000055] text-white text-base py-4">
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>

            {/* Content sheet that slides over the image */}
            <div className="relative z-30 bg-[#111216] min-h-screen rounded-t-3xl -mt-20 pt-6">
              {/* Sheet handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="px-4 pb-4 space-y-4">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-white/10">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="bg-transparent p-0 h-auto border-0">
                      <TabsTrigger value="details" className="text-sm data-[state=active]:text-white text-white/70 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none pb-2">
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="gallery" className="text-sm data-[state=active]:text-white text-white/70 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none pb-2 ml-6">
                        Gallery (2)
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="text-sm data-[state=active]:text-white text-white/70 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none pb-2 ml-6">
                        Comments (0)
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {['🎭', '📷', '🎵', 'AnyPOV', 'Fantasy', 'Furry', 'Monster', 'Mystery', 'Non-Human', 'OC', 'Sci-Fi'].map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`${index < 3 ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-white/10 text-white/70 border-white/20'} text-xs px-2 py-1 rounded-full`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Audio Section */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Final Fantasy VII - Woozy Spec...</div>
                    <div className="text-xs text-white/60 flex items-center gap-1">
                      <span className="w-4 h-1 bg-pink-500 rounded"></span>
                      <span>SOUNDCLOUD</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">[Cute, Alien, Oblivious]</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    While investigating strange lights in the woods, you come across a cute alien woman who is fascinated by Earth but knows very little about it.
                  </p>
                </div>

                {/* Extra content to ensure scrolling works */}
                <div className="space-y-4 pt-8">
                  <div className="h-40 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-white/40">Gallery placeholder</span>
                  </div>
                  <div className="h-40 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-white/40">Comments placeholder</span>
                  </div>
                  <div className="h-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
