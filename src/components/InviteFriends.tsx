import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { getUserInviteStats, ensureUserHasInviteCode, InviteStats } from "@/lib/supabase";

export const InviteFriends = () => {
  const { user } = useUser();
  const [inviteStats, setInviteStats] = useState<InviteStats>({
    invite_code: '',
    invites_used: 0,
    max_invites: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInviteStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Ensure user has an invite code
        const inviteCode = await ensureUserHasInviteCode(user.id);
        
        // Get invite stats
        const stats = await getUserInviteStats(user.id);
        
        // If stats don't have invite code, use the one we just ensured
        if (!stats.invite_code && inviteCode) {
          stats.invite_code = inviteCode;
        }
        
        setInviteStats(stats);
      } catch (error) {
        console.error('Error loading invite stats:', error);
        toast.error('Failed to load invite information');
      } finally {
        setLoading(false);
      }
    };

    loadInviteStats();
  }, [user]);


  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-400">Invite Friends</h3>
          <div className="flex items-center gap-2 text-green-400">
            <Coins className="h-5 w-5" />
            <span className="text-lg font-bold">+100</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-300 text-sm">
            Invite your new friends to fill in your code within 24 hours of registration.
          </p>
          <p className="text-gray-400 text-xs">
            Notice: New user can only use one invitation code and the invitation code can invite up to 10 new users.
          </p>
        </div>

        {/* Usage Counter */}
        <div className="text-center mb-4">
          <span className="text-gray-400 text-lg">
            ({inviteStats.invites_used} / {inviteStats.max_invites})
          </span>
        </div>

        {/* Invite Code Display */}
        <div className="mb-6">
          <div className="bg-green-500 text-black px-6 py-3 rounded-full text-center text-lg font-bold mb-4">
            {inviteStats.invite_code || 'Loading...'}
          </div>
          
        </div>

        {/* Stats */}
        {inviteStats.invites_used > 0 && (
          <div className="text-center text-sm text-gray-400 border-t border-gray-700 pt-4">
            🎉 You've earned {inviteStats.invites_used * 100} coins from {inviteStats.invites_used} successful invite{inviteStats.invites_used !== 1 ? 's' : ''}!
          </div>
        )}

        {inviteStats.invites_used >= inviteStats.max_invites && (
          <div className="text-center text-sm text-yellow-400 mt-2">
            ⚠️ You've reached the maximum number of invites (10/10)
          </div>
        )}
      </CardContent>
    </Card>
  );
};
