import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createOrUpdateUser } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) {
        console.log('Clerk not loaded yet');
        return;
      }

      if (!user) {
        console.log('No user signed in');
        return;
      }

      console.log('Attempting to sync user:', user.id);

      try {
        // Sync user with Supabase
        const result = await createOrUpdateUser(user);
        console.log('User synced with Supabase successfully:', result);
        toast.success('User synced successfully!');
      } catch (error) {
        console.error('Error syncing user:', error);
        toast.error(`Failed to sync user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
