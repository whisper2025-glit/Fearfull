import { supabase } from './supabase';

import { supabase } from './supabase';

// Helper function to generate username from display name
const generateUsername = (displayName: string, userId: string): string => {
  // Remove spaces and special characters, convert to lowercase
  let username = displayName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20); // Limit length

  // If empty after cleaning, use part of user ID
  if (!username) {
    username = 'user' + userId.substring(0, 8);
  }

  // Add part of user ID to ensure uniqueness
  username += userId.substring(0, 4);

  return username;
};

// Helper to generate invite code (simplified version)
const generateInviteCode = async (): Promise<string> => {
  // Generate a random 8-character invite code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createOrUpdateUser = async (clerkUser: any) => {
  console.log('🔧 createOrUpdateUser called with:', {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    fullName: clerkUser.fullName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress
  });

  try {
    // First, check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUser.id)
      .single();

    const newDisplayName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('⚠️ Error checking existing user:', fetchError);
    }

    let userData: any;

    if (existingUser) {
      console.log('📖 Existing user found:', {
        existing_full_name: existingUser.full_name,
        existing_username: existingUser.username,
        new_display_name: newDisplayName
      });

      // For existing users, be conservative about updates to preserve stability
      userData = {
        id: clerkUser.id,
        // PRESERVE existing full_name unless it's empty/null or "User"
        full_name: (existingUser.full_name && existingUser.full_name !== 'User') 
          ? existingUser.full_name 
          : newDisplayName,
        // PRESERVE existing username unless it's empty/null
        username: existingUser.username || clerkUser.username || generateUsername(newDisplayName, clerkUser.id),
        // Always update these fields as they might change
        email: clerkUser.emailAddresses?.[0]?.emailAddress || existingUser.email,
        avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
        // Keep all existing data intact
        invite_code: existingUser.invite_code,
        bio: existingUser.bio,
        gender: existingUser.gender,
        coins: existingUser.coins,
        banner_url: existingUser.banner_url,
        updated_at: new Date().toISOString()
      };

      console.log('📝 Preserving existing full_name:', userData.full_name);

    } else {
      console.log('🆕 Creating new user');
      
      // Generate invite code for new users
      let inviteCode = '';
      try {
        inviteCode = await generateInviteCode();
      } catch (error) {
        console.error('⚠️ Failed to generate invite code, will assign later');
      }

      // For new users, use all the Clerk data
      userData = {
        id: clerkUser.id,
        username: clerkUser.username || generateUsername(newDisplayName, clerkUser.id),
        full_name: newDisplayName,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
        avatar_url: clerkUser.imageUrl || null,
        invite_code: inviteCode,
        updated_at: new Date().toISOString()
      };
    }

    console.log('📊 User data to upsert:', userData);

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase upsert error:', error);
      // If RLS error, try without select to avoid permission issues
      if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('RLS')) {
        console.log('🔄 RLS/permission error detected, trying simple upsert...');
        const { error: retryError } = await supabase
          .from('users')
          .upsert(userData, { onConflict: 'id' });

        if (!retryError) {
          console.log('✅ Simple upsert successful');
          return userData; // Return the data we tried to insert
        } else {
          console.error('❌ Simple upsert also failed:', retryError);
          throw retryError;
        }
      }
      throw error;
    }

    console.log('✅ Supabase upsert successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in createOrUpdateUser:', error);
    // Return fallback user data even if DB failed - app should continue working
    console.log('⚠️ Returning fallback user data despite DB error');
    const fallbackDisplayName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
    return {
      id: clerkUser.id,
      username: clerkUser.username || generateUsername(fallbackDisplayName, clerkUser.id),
      full_name: fallbackDisplayName,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
      avatar_url: clerkUser.imageUrl || null
    };
  }
};
