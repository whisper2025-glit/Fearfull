import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createOrUpdateUser, createSupabaseClientWithClerkAuth } from '@/lib/supabase';
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
        // Get Clerk JWT token
        const token = await getToken({ template: 'supabase' });
        console.log('🔐 Retrieved Clerk token for Supabase authentication', !!token);
        
        // Create Supabase client with Clerk authentication
        const supabaseWithAuth = createSupabaseClientWithClerkAuth(async () => {
          return await getToken({ template: 'supabase' });
        });

        console.log('🚀 Attempting to sync user with authenticated Supabase client:', {
          id: user.id,
          firstName: user.firstName,
          fullName: user.fullName,
          username: user.username,
          email: user.emailAddresses?.[0]?.emailAddress
        });

        // Sync user with Supabase using the authenticated client
        const result = await createOrUpdateUser(user);
        console.log('✅ User synced with Supabase successfully:', result);
        toast.success(`User ${result.username} synced successfully!`);
      } catch (error) {
        console.error('❌ Error syncing user:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error
        });
        toast.error(`Failed to sync user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    syncUser();
  }, [user, isLoaded, getToken]);

  return { user, isLoaded };
};
