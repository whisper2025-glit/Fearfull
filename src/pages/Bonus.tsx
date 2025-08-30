import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Clock } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

const utcDateKey = () => new Date().toISOString().split("T")[0];
const startOfTodayUTC = () => new Date(`${utcDateKey()}T00:00:00.000Z`);
const nextMidnightUTC = () => {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
};

const formatCountdown = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const COIN_KEY = "bonus:coins";
const CHECKIN_KEY = "bonus:checkin:"; // + yyyy-mm-dd
const CONVO_KEY = "bonus:conversation:"; // + yyyy-mm-dd

export default function Bonus() {
  const { user } = useUser();
  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem(COIN_KEY) || 0));
  const [now, setNow] = useState<number>(Date.now());
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(() => !!localStorage.getItem(CHECKIN_KEY + utcDateKey()));
  const [hasConvoReward, setHasConvoReward] = useState<boolean>(() => !!localStorage.getItem(CONVO_KEY + utcDateKey()));
  const [conversationEligible, setConversationEligible] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const todayKey = utcDateKey();
    setHasCheckedIn(!!localStorage.getItem(CHECKIN_KEY + todayKey));
    setHasConvoReward(!!localStorage.getItem(CONVO_KEY + todayKey));
  }, [now]);

  useEffect(() => {
    const loadEligibility = async () => {
      if (!user) { setConversationEligible(false); return; }
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id)
          .eq('is_bot', false)
          .gte('created_at', startOfTodayUTC().toISOString());
        if (error) {
          console.error('Eligibility check failed', error);
          setConversationEligible(false);
        } else {
          setConversationEligible((count || 0) > 0);
        }
      } catch (e) {
        console.error(e);
        setConversationEligible(false);
      }
    };
    loadEligibility();
  }, [user]);

  const timeToReset = useMemo(() => nextMidnightUTC().getTime() - now, [now]);

  const addCoins = (amount: number) => {
    setCoins(prev => {
      const next = prev + amount;
      localStorage.setItem(COIN_KEY, String(next));
      return next;
    });
  };

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    addCoins(50);
    localStorage.setItem(CHECKIN_KEY + utcDateKey(), '1');
    setHasCheckedIn(true);
    toast.success("Daily check-in successful! +50 coins");
  };

  const handleConvoReward = () => {
    if (hasConvoReward) return;
    if (!conversationEligible) { toast.error("Have a conversation today to claim this reward."); return; }
    addCoins(10);
    localStorage.setItem(CONVO_KEY + utcDateKey(), '1');
    setHasConvoReward(true);
    toast.success("Conversation reward claimed! +10 coins");
  };

  return (
    <Layout>
      <div className="flex-1 bg-background text-foreground min-h-full">
        <div className="p-4 space-y-4">
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-green-400">
                  <Coins className="h-5 w-5" />
                  <span className="text-sm font-semibold">{coins}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-primary">Daily Tasks</h2>
            <p className="text-xs text-muted-foreground">Daily tasks refresh at UTC+0 00:00:00 daily.</p>

            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-400">Rewards for Daily Check-In</h3>
                  <p className="text-xs text-muted-foreground">Check in and get Joyland coins every day!</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Refresh in</span>
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">{formatCountdown(timeToReset)}</Badge>
                  </div>
                </div>
                <Button disabled={hasCheckedIn} onClick={handleCheckIn} className="rounded-full">
                  {hasCheckedIn ? "Claimed" : "+50"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-400">Daily Conversation</h3>
                  <p className="text-xs text-muted-foreground">Conversation with any character</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Refresh in</span>
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">{formatCountdown(timeToReset)}</Badge>
                  </div>
                </div>
                <Button disabled={hasConvoReward || !conversationEligible} onClick={handleConvoReward} className="rounded-full">
                  {hasConvoReward ? "Claimed" : conversationEligible ? "+10" : "Do a chat"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
