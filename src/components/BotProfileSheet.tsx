import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, MessageCircle, Heart, Send, ThumbsUp, ThumbsDown, Clock, User } from "lucide-react";

const HERO_IMAGE = "https://cdn.builder.io/api/v1/image/assets%2F420adf53974e411387df983f01823d73%2F4635cc3157e045f592ade58eeea4af3b?format=webp&width=800";

export function BotProfileSheet() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <User className="mr-2 h-4 w-4" />
          Bot Profile
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#111216] text-white text-xs h-screen border-0">
        <div className="relative h-full">
          {/* Scrollable Content */}
          <div className="overflow-y-auto h-full">
            {/* Hero Image with overlayed info */}
            <div className="relative w-full h-[460px] sm:h-[520px] md:h-[560px]">
              <img src={HERO_IMAGE} alt="Character" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/60 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold truncate">Cata | Curious Innocent Alien</h2>
                  <Button variant="outline" size="icon" className="border-white/20 text-white bg-transparent hover:bg-white/10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/80">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>59.6K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>1008 tokens</span>
                  </div>
                </div>
                <div className="w-full rounded-full p-[2px] bg-gradient-to-r from-pink-500 to-cyan-400">
                  <Button className="w-full rounded-full bg-[#00000033] hover:bg-[#00000055] text-white text-sm py-2">Start Chat</Button>
                </div>
              </div>
            </div>

            <div className="relative z-10 -mt-6 px-4 pb-4 space-y-3">
              {/* Tabs and chips under hero */}
              <Card className="bg-[#171821]/80 backdrop-blur-sm border-white/10 p-3 rounded-xl">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="details" className="text-xs data-[state=active]:text-white text-white/70">Details</TabsTrigger>
                    <TabsTrigger value="gallery" className="text-xs data-[state=active]:text-white text-white/70">Gallery (2)</TabsTrigger>
                    <TabsTrigger value="comments" className="text-xs data-[state=active]:text-white text-white/70">Comments (0)</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['AnyPOV','Fantasy','Furry','Monster','Mystery','Non-Human','OC','Sci-Fi'].map((tag)=> (
                    <Badge key={tag} variant="secondary" className="bg-white/10 text-white border border-white/20 text-xs px-2 py-1 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Description */}
              <Card className="bg-[#171821]/80 backdrop-blur-sm border-white/10 p-3 rounded-xl">
                <div className="font-semibold text-xs mb-2">[Cute, Alien, Oblivious]</div>
                <p className="text-white/80 text-xs">While investigating strange lights in the woods, you come across a cute alien woman who is fascinated by Earth but knows very little about it.</p>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
