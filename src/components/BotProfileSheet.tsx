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
              {/* Title + Actions */}
              <Card className="bg-[#171821]/80 backdrop-blur-sm border-white/10 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm font-semibold truncate">Bea | Elf stuck in a wall</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="border-white/20 text-white bg-transparent hover:bg-white/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white text-xs px-3">Chat with me</Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-white/80 mt-2">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>22.6k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>15</span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-white/80 mt-2">Naeth! Someone help me get out of here!!</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "Fantasy","Sassy","Proud","Female","Thinks elves >>> Humans","Impatient","World of Arnheim"
                  ].map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/10 text-white border border-white/20 text-xs px-2 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Creator Row */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span>Create by</span>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={HERO_IMAGE} alt="creator" />
                      <AvatarFallback className="text-xs">LC</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold tracking-wider text-xs">LOCARD</span>
                    <span>👑</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white text-xs px-3 py-1 h-8">+ Follow</Button>
                    <Button variant="outline" size="icon" className="border-white/20 text-white bg-transparent hover:bg-white/10 h-8 w-8">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Reviews */}
              <Card className="bg-[#171821]/80 backdrop-blur-sm border-white/10 p-3 rounded-xl">
                <Tabs defaultValue="review" className="w-full">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="review" className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-white text-white/70">Review</TabsTrigger>
                    <TabsTrigger value="post" className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-white text-white/70">Post</TabsTrigger>
                  </TabsList>
                  <TabsContent value="review" className="mt-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/60 text-xs">Type your reviews about character</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><ThumbsUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><ThumbsDown className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><Clock className="h-4 w-4" /></Button>
                        </div>
                        <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white text-xs">Post review</Button>
                      </div>
                    </div>

                    <div className="text-white/70 text-xs mt-3">7 reviews ( 3 👍 | 2 😐 )</div>

                    {/* Review item */}
                    <div className="mt-3 flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={HERO_IMAGE} />
                        <AvatarFallback className="text-xs">EG</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-xs">egg</div>
                        <p className="text-white/80 text-xs">first of all why she stuck second of all why she not bullet proof</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="post"></TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
