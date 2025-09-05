import { supabase } from './supabase';

// Returns true if followerId is following followingId
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  if (!followerId || !followingId || followerId === followingId) return false;
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('isFollowing error (likely table missing or RLS):', error);
      return false;
    }
    return !!data;
  } catch (err) {
    console.warn('isFollowing unexpected error:', err);
    return false;
  }
};

// Toggle follow; returns current state after operation (true => now following)
export const toggleFollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  if (!followerId || !followingId || followerId === followingId) return false;
  try {
    const { data: existing, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('toggleFollowUser check error:', checkError);
      throw checkError;
    }

    if (existing) {
      const { error: delError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      if (delError) {
        console.error('toggleFollowUser delete error:', delError);
        throw delError;
      }
      return false; // now unfollowed
    } else {
      const { error: insError } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
      if (insError) {
        console.error('toggleFollowUser insert error:', insError);
        throw insError;
      }
      return true; // now following
    }
  } catch (err: any) {
    console.warn('toggleFollowUser unexpected error (likely table missing or RLS):', err?.message || err);
    // Fail silently with no state change
    throw err;
  }
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);
    if (error) {
      console.warn('getFollowersCount error (fallback to 0):', error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn('getFollowersCount unexpected error:', err);
    return 0;
  }
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId);
    if (error) {
      console.warn('getFollowingCount error (fallback to 0):', error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn('getFollowingCount unexpected error:', err);
    return 0;
  }
};
