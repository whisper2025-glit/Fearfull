import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createOrUpdateUser, supabase, processInviteCode } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();

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

      } catch (error) {
        console.error('❌ Error syncing user:', error);
        // Don't show error toasts for user sync issues, just log them
        console.log('⚠️ User sync failed, but app will continue to work');
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
