import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createOrUpdateProfile } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Sync user profile with Supabase
        await createOrUpdateProfile(user);
        console.log('User profile synced with Supabase');
      } catch (error) {
        console.error('Error syncing user profile:', error);
        toast.error('Failed to sync user profile');
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
