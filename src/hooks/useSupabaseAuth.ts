import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setSupabaseAuth } from '@/lib/supabase';

// Keeps Supabase authenticated with the current Clerk session JWT
export const useSupabaseAuth = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        if (!isSignedIn) {
          await setSupabaseAuth(null);
          return;
        }
        // Prefer the "supabase" JWT template if configured; fall back to default
        const token = (await getToken({ template: 'supabase' }).catch(() => getToken())) || null;
        if (!active) return;
        await setSupabaseAuth(token);
      } catch (err) {
        console.warn('Supabase auth sync failed', err);
      }
    };

    sync();

    // Attempt a refresh when tab gains focus (helps if token rotated)
    const onFocus = () => sync();
    window.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      window.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [getToken, isSignedIn]);
};
