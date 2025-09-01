import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createOrUpdateUser, supabase, processInviteCode, setSupabaseAuth } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    console.log('🔄 useUserSync useEffect triggered', {
      isLoaded,
      hasUser: !!user,
      userId: user?.id
    });

    const syncUser = async () => {
      if (!isLoaded) {
        console.log('⏳ Clerk not loaded yet');
        return;
      }

      if (!user) {
        console.log('❌ No user signed in');
        return;
      }

      try {
        console.log('🚀 Attempting to sync user with Supabase:', {
          id: user.id,
          firstName: user.firstName,
          fullName: user.fullName,
          username: user.username,
          email: user.emailAddresses?.[0]?.emailAddress
        });

        // Get Clerk token and set Supabase auth session
        try {
          const token = await getToken({ template: 'supabase' });
          if (token) {
            console.log('🔑 Setting Supabase auth with Clerk token');
            await setSupabaseAuth(token);
          }
        } catch (tokenError) {
          console.warn('⚠️ Could not get Clerk token, using anonymous access:', tokenError);
        }

        // Sync user with Supabase
        const result = await createOrUpdateUser(user);
        console.log('✅ User synced with Supabase successfully:', result);

        // Process invite code if present in URL (only for new or first-time users)
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');

        if (inviteCode) {
          console.log('🎫 Processing invite code:', inviteCode);
          try {
            const inviteResult = await processInviteCode(user.id, inviteCode);
            if (inviteResult.success) {
              toast.success(`Welcome! Invite processed successfully. ${inviteResult.coinsAwarded} coins awarded to your inviter!`);
              // Remove invite parameter from URL
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('invite');
              window.history.replaceState({}, '', newUrl.toString());
            } else {
              toast.info(`Welcome! Note: ${inviteResult.message}`);
            }
          } catch (error) {
            console.error('Error processing invite:', error);
            toast.info('Welcome! Note: Could not process invite code.');
          }
        } else {
          toast.success(`Welcome, ${result.username || result.full_name || 'User'}!`);
        }
      } catch (error) {
        console.error('❌ Error syncing user:', error);
        // Don't show error toasts for user sync issues, just log them
        console.log('⚠️ User sync failed, but app will continue to work');
      }
    };

    // Handle sign out cleanup
    const handleSignOut = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        console.log('🔓 User signed out, clearing Supabase session');
        try {
          await setSupabaseAuth(null);
        } catch (error) {
          console.warn('⚠️ Error clearing Supabase session:', error);
        }
      }
    };

    if (isLoaded) {
      if (user) {
        syncUser();
      } else {
        handleSignOut();
      }
    }
  }, [user, isLoaded, getToken]);

  // Also handle token refresh
  useEffect(() => {
    if (!user || !isLoaded) return;

    const refreshSupabaseAuth = async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await setSupabaseAuth(token);
        }
      } catch (error) {
        console.warn('⚠️ Error refreshing Supabase auth:', error);
      }
    };

    // Refresh auth every 45 minutes (Clerk tokens expire after 1 hour)
    const interval = setInterval(refreshSupabaseAuth, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, isLoaded, getToken]);

  return { user, isLoaded };
};
