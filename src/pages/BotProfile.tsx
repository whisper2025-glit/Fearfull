import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Share2, MessageCircle, Heart, Send, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

const HERO_IMAGE = "https://cdn.builder.io/api/v1/image/assets%2F1def39c99b334f56b1a37c019ef7ea60%2F881e74fa92134d51b0fa94b36bab6d7d?format=webp&width=1200";

export default function BotProfile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111216] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-3 bg-[#1a1b22] border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Bot profile</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Hero Image */}
        <Card className="bg-black/40 border-white/10 overflow-hidden rounded-xl">
          <div className="w-full h-[560px] sm:h-[600px] md:h-[640px] lg:h-[720px]">
            <img src={HERO_IMAGE} alt="Bea" className="h-full w-full object-cover" />
          </div>
        </Card>

        {/* Title + Actions */}
        <Card className="bg-[#171821] border-white/10 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-semibold truncate">Bea | Elf stuck in a wall</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-white/20 text-white bg-transparent hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white px-3">Chat with me</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-white/80 mt-2">
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
          <p className="text-sm text-white/80 mt-2">Naeth! Someone help me get out of here!!</p>

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
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>Create by</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={HERO_IMAGE} alt="creator" />
                <AvatarFallback>LC</AvatarFallback>
              </Avatar>
              <span className="font-semibold tracking-wider">LOCARD</span>
              <span>👑</span>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white px-3 py-1 h-8">+ Follow</Button>
              <Button variant="outline" size="icon" className="border-white/20 text-white bg-transparent hover:bg-white/10 h-8 w-8">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Reviews */}
        <Card className="bg-[#171821] border-white/10 p-3 rounded-xl">
          <Tabs defaultValue="review" className="w-full">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger value="review" className="data-[state=active]:bg-transparent data-[state=active]:text-white text-white/70">Review</TabsTrigger>
              <TabsTrigger value="post" className="data-[state=active]:bg-transparent data-[state=active]:text-white text-white/70">Post</TabsTrigger>
            </TabsList>
            <TabsContent value="review" className="mt-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-white/60 text-sm">Type your reviews about character</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><ThumbsUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><ThumbsDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10"><Clock className="h-4 w-4" /></Button>
                  </div>
                  <Button className="bg-[#2a74ff] hover:bg-[#2363d6] text-white">Post review</Button>
                </div>
              </div>

              <div className="text-white/70 text-sm mt-3">7 reviews ( 3 👍 | 2 😐 )</div>

              {/* Review item */}
              <div className="mt-3 flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={HERO_IMAGE} />
                  <AvatarFallback>EG</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">egg</div>
                  <p className="text-white/80 text-sm">first of all why she stuck second of all why she not bullet proof</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="post"></TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
