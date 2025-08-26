import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createOrUpdateUser } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Sync user with Supabase
        await createOrUpdateUser(user);
        console.log('User synced with Supabase');
      } catch (error) {
        console.error('Error syncing user:', error);
        toast.error('Failed to sync user');
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
