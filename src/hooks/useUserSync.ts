import { useEffect } from 'react';
import { useUser } from '@/lib/fake-clerk';
import { processInviteCode } from '@/lib/supabase';
import { createOrUpdateUser } from '@/lib/createOrUpdateUser';
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

        // Sync user with Supabase using the basic client (no JWT required)
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
          // Use the best available name for welcome message
          const welcomeName = result.full_name || result.username || user.fullName || user.firstName || user.username || 'User';
          toast.success(`Welcome, ${welcomeName}!`);
        }
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
