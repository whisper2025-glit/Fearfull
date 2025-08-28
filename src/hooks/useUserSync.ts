import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createOrUpdateUser, supabase } from '@/lib/supabase';
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
        console.log('❌ No user signed in, clearing Supabase auth');
        await setSupabaseAuth(null);
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

        // Get Clerk JWT token and set it for Supabase auth
        const token = await getToken({ template: 'supabase' });
        if (token) {
          console.log('🔑 Setting Supabase auth with Clerk token');
          await setSupabaseAuth(token);
        }

        // Sync user with Supabase using the basic client (no JWT required for user creation)
        const result = await createOrUpdateUser(user);
        console.log('✅ User synced with Supabase successfully:', result);
        toast.success(`Welcome, ${result.username || result.full_name || 'User'}!`);
      } catch (error) {
        console.error('❌ Error syncing user:', error);
        // Don't show error toasts for user sync issues, just log them
        console.log('⚠️ User sync failed, but app will continue to work');
      }
    };

    syncUser();
  }, [user, isLoaded, getToken]);

  return { user, isLoaded };
};
