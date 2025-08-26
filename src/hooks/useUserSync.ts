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
        // Try to get Clerk JWT token for Supabase
        let token;
        try {
          token = await getToken({ template: 'supabase' });
          console.log('🔐 Retrieved Clerk token for Supabase authentication', !!token);
        } catch (tokenError) {
          console.warn('⚠️ Supabase JWT template not configured in Clerk. Using fallback authentication.');
          // Fallback: try to get default token or continue without token
          try {
            token = await getToken();
          } catch {
            token = null;
          }
        }

        // Create Supabase client with Clerk authentication (or fallback)
        const supabaseWithAuth = createSupabaseClientWithClerkAuth(async () => {
          try {
            return await getToken({ template: 'supabase' });
          } catch {
            // Fallback to default token
            return await getToken();
          }
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
        toast.success(`Welcome, ${result.username || result.full_name || 'User'}!`);
      } catch (error) {
        console.error('❌ Error syncing user:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error
        });
        // Only show error toast if it's not a JWT template issue
        if (!error.message?.includes('JWT template')) {
          toast.error(`Failed to sync user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };

    syncUser();
  }, [user, isLoaded, getToken]);

  return { user, isLoaded };
};
