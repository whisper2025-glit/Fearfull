import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Clock } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { supabase, getUserCoins, incrementUserCoins, canClaimDailyReward, markDailyRewardClaimed, migrateLocalStorageCoins } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { InviteFriends } from "@/components/InviteFriends";

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
  const navigate = useNavigate();
  const [coins, setCoins] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const [hasConvoReward, setHasConvoReward] = useState<boolean>(false);
  const [conversationEligible, setConversationEligible] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!user) return;

      const canClaimCheckin = await canClaimDailyReward(user.id, 'checkin');
      const canClaimConvo = await canClaimDailyReward(user.id, 'conversation');

      setHasCheckedIn(!canClaimCheckin);
      setHasConvoReward(!canClaimConvo);
    };

    checkClaimStatus();
  }, [now, user]);

  useEffect(() => {
    const loadEligibility = async () => {
      if (!user) { setConversationEligible(false); return; }
      try {
        const { data, error } = await supabase
          .rpc('user_messages_today_count', { p_user_id: user.id });
        if (error) {
          console.error('Eligibility check failed', error);
          setConversationEligible(false);
        } else {
          setConversationEligible((Number(data) || 0) > 0);
        }
      } catch (e) {
        console.error(e);
        setConversationEligible(false);
      }
    };
    loadEligibility();
  }, [user]);

  // Load user coins from database and migrate localStorage coins
  useEffect(() => {
    const loadUserCoins = async () => {
      if (!user) return;

      try {
        // First, migrate any localStorage coins to database
        await migrateLocalStorageCoins(user.id);

        // Then load the current balance from database
        const currentCoins = await getUserCoins(user.id);
        setCoins(currentCoins);
      } catch (error) {
        console.error('Error loading user coins:', error);
        // Don't show error to user, we'll fallback to 0 coins
      }
    };

    loadUserCoins();
  }, [user]);

  const timeToReset = useMemo(() => nextMidnightUTC().getTime() - now, [now]);

  const addCoins = async (amount: number, reason: string) => {
    if (!user) return;
    try {
      const newBalance = await incrementUserCoins(user.id, amount, reason);
      setCoins(newBalance);
    } catch (error) {
      console.error('Error adding coins:', error);
      toast.error('Failed to add coins');
    }
  };

  const handleCheckIn = async () => {
    if (hasCheckedIn || !user) return;

    // Double-check server-side before claiming
    const canClaim = await canClaimDailyReward(user.id, 'checkin');
    if (!canClaim) {
      toast.error('Daily check-in already claimed today!');
      setHasCheckedIn(true);
      return;
    }

    await addCoins(50, 'daily_checkin');
    const success = await markDailyRewardClaimed(user.id, 'checkin', 50);

    if (success) {
      setHasCheckedIn(true);
      toast.success("Daily check-in successful! +50 coins");
    } else {
      toast.error('Failed to record claim. Please try again.');
    }
  };

  const handleConvoReward = async () => {
    if (hasConvoReward || !user) return;
    if (!conversationEligible) {
      toast.error("Have a conversation today to claim this reward.");
      return;
    }

    // Double-check server-side before claiming
    const canClaim = await canClaimDailyReward(user.id, 'conversation');
    if (!canClaim) {
      toast.error('Conversation reward already claimed today!');
      setHasConvoReward(true);
      return;
    }

    await addCoins(10, 'daily_conversation_bonus');
    const success = await markDailyRewardClaimed(user.id, 'conversation', 10);

    if (success) {
      setHasConvoReward(true);
      toast.success("Conversation reward claimed! +10 coins");
    } else {
      toast.error('Failed to record claim. Please try again.');
    }
  };


  return (
    <Layout headerPosition="fixed" contentUnderHeader>
      <div className="flex-1 bg-background text-foreground min-h-full">
        <div className="px-4 pb-4 pt-20 space-y-4">
          <Card className="bg-gradient-to-r from-gray-500/20 to-cyan-500/20 border-border">
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
                  <p className="text-xs text-muted-foreground">Check in and get Whisperchat coins every day!</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Refresh in</span>
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">{formatCountdown(timeToReset)}</Badge>
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
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">{formatCountdown(timeToReset)}</Badge>
                  </div>
                </div>
                <Button disabled={hasConvoReward} onClick={() => { if (conversationEligible) { handleConvoReward(); } else { navigate('/'); } }} className="rounded-full">
                  {hasConvoReward ? "Claimed" : conversationEligible ? "+10" : "Do chat"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Invite Friends Section */}
          <div className="mt-8">
            <InviteFriends />
          </div>
        </div>
      </div>
    </Layout>
  );
}
