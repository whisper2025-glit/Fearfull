import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create Supabase client with Clerk authentication
export const createSupabaseClientWithClerkAuth = (getToken: () => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: async () => {
          const token = await getToken();
          return token ? `Bearer ${token}` : '';
        }
      }
    }
  });
};

// Function to set Clerk token for Supabase authentication
export const setSupabaseAuth = async (token: string | null) => {
  if (token) {
    // Use Supabase's built-in auth system to set the session
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Clerk handles refresh
    });
  } else {
    // Sign out from Supabase when no Clerk token
    await supabase.auth.signOut();
  }
};

// Create authenticated Supabase client for user operations
export const createAuthenticatedSupabaseClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // Clerk user ID
          username?: string | null;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          gender: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          gender?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          gender?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          owner_id: string; // References users.id (Clerk user ID)
          name: string;
          intro: string;
          scenario: string | null;
          greeting: string | null;
          personality: string | null;
          appearance: string | null;
          avatar_url: string | null;
          scene_url: string | null;
          visibility: 'public' | 'unlisted' | 'private';
          rating: 'filtered' | 'unfiltered';
          tags: string[] | null;
          gender: string | null;
          age: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          intro: string;
          scenario?: string | null;
          greeting?: string | null;
          personality?: string | null;
          appearance?: string | null;
          avatar_url?: string | null;
          scene_url?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          rating?: 'filtered' | 'unfiltered';
          tags?: string[] | null;
          gender?: string | null;
          age?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          intro?: string;
          scenario?: string | null;
          greeting?: string | null;
          personality?: string | null;
          appearance?: string | null;
          avatar_url?: string | null;
          scene_url?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          rating?: 'filtered' | 'unfiltered';
          tags?: string[] | null;
          gender?: string | null;
          age?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      personas: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          name: string;
          gender: 'Male' | 'Female' | 'Non-binary';
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          gender: 'Male' | 'Female' | 'Non-binary';
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          gender?: 'Male' | 'Female' | 'Non-binary';
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          character_id: string;
          persona_id: string | null; // References personas.id
          title: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          is_archived: boolean;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id: string;
          persona_id?: string | null;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string;
          persona_id?: string | null;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          character_id: string;
          conversation_id: string | null; // References conversations.id
          author_id: string | null; // Clerk user ID for user messages, null for bot
          content: string;
          is_bot: boolean;
          type: 'intro' | 'scenario' | 'regular';
          created_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          conversation_id?: string | null;
          author_id?: string | null;
          content: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular';
          created_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          conversation_id?: string | null;
          author_id?: string | null;
          content?: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular';
          created_at?: string;
        };
      comments: {
        Row: {
          id: string;
          character_id: string;
          author_id: string | null; // Clerk user ID
          parent_id: string | null; // For replies/threading
          content: string;
          likes_count: number;
          reply_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          author_id?: string | null;
          parent_id?: string | null;
          content: string;
          likes_count?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          author_id?: string | null;
          parent_id?: string | null;
          content?: string;
          likes_count?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string; // Clerk user ID
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      chat_settings: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          model_id: string;
          temperature: number;
          content_diversity: number;
          max_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id: string;
          temperature?: number;
          content_diversity?: number;
          max_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string;
          temperature?: number;
          content_diversity?: number;
          max_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorited: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          character_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string;
          created_at?: string;
        };
      };
      adventures: {
        Row: {
          id: string;
          owner_id: string; // References users.id (Clerk user ID)
          name: string;
          plot: string;
          introduction: string | null;
          adventure_image_url: string | null;
          background_image_url: string | null;
          adventure_type: 'mcp' | 'custom';
          source_story: string | null; // For MCP server type
          mcp_settings: string | null; // For MCP server type
          custom_settings: string | null; // For custom type
          ai_instructions: string | null; // For custom type
          story_summary: string | null; // For custom type
          plot_essentials: string | null; // For custom type
          story_cards: any | null; // JSONB array of story card objects
          category: string | null;
          rating: 'all-ages' | 'teens' | 'adults';
          persona: string | null;
          visibility: 'public' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          plot: string;
          introduction?: string | null;
          adventure_image_url?: string | null;
          background_image_url?: string | null;
          adventure_type?: 'mcp' | 'custom';
          source_story?: string | null;
          mcp_settings?: string | null;
          custom_settings?: string | null;
          ai_instructions?: string | null;
          story_summary?: string | null;
          plot_essentials?: string | null;
          story_cards?: any | null;
          category?: string | null;
          rating?: 'all-ages' | 'teens' | 'adults';
          persona?: string | null;
          visibility?: 'public' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          plot?: string;
          introduction?: string | null;
          adventure_image_url?: string | null;
          background_image_url?: string | null;
          adventure_type?: 'mcp' | 'custom';
          source_story?: string | null;
          mcp_settings?: string | null;
          custom_settings?: string | null;
          ai_instructions?: string | null;
          story_summary?: string | null;
          plot_essentials?: string | null;
          story_cards?: any | null;
          category?: string | null;
          rating?: 'all-ages' | 'teens' | 'adults';
          persona?: string | null;
          visibility?: 'public' | 'private';
          created_at?: string;
          updated_at?: string;
        };
      };
      favorited_adventures: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          adventure_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          adventure_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          adventure_id?: string;
          created_at?: string;
        };
      };
      adventure_conversations: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          adventure_id: string;
          persona_id: string | null;
          title: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          is_archived: boolean;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          adventure_id: string;
          persona_id?: string | null;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          adventure_id?: string;
          persona_id?: string | null;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      adventure_messages: {
        Row: {
          id: string;
          adventure_id: string;
          conversation_id: string | null;
          user_id: string | null; // Clerk user ID for user messages, null for AI
          content: string;
          is_bot: boolean;
          type: 'intro' | 'scenario' | 'regular' | 'choice';
          choices: any[]; // JSONB array
          metadata: any; // JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          adventure_id: string;
          conversation_id?: string | null;
          user_id?: string | null;
          content: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular' | 'choice';
          choices?: any[];
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          adventure_id?: string;
          conversation_id?: string | null;
          user_id?: string | null;
          content?: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular' | 'choice';
          choices?: any[];
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
};
}

// Helper functions for common operations
export const uploadImage = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return { data, publicUrl };
};

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

export const createOrUpdateUser = async (clerkUser: any) => {
  console.log('🔧 createOrUpdateUser called with:', {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    fullName: clerkUser.fullName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress
  });

  const displayName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
  const userData = {
    id: clerkUser.id,
    username: clerkUser.username || generateUsername(displayName, clerkUser.id),
    full_name: displayName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
    avatar_url: clerkUser.imageUrl || null,
    updated_at: new Date().toISOString()
  };

  console.log('📊 User data to upsert:', userData);

  try {
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
    // Return the user data even if DB failed - app should continue working
    console.log('⚠️ Returning user data despite DB error');
    return userData;
  }
};

// Persona CRUD operations
export interface PersonaData {
  id?: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  description: string;
  applyToNewChats: boolean;
}

export const createPersona = async (userId: string, personaData: Omit<PersonaData, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .insert({
        user_id: userId,
        name: personaData.name,
        gender: personaData.gender,
        description: personaData.description || null,
        is_default: personaData.applyToNewChats
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating persona:', error);
      throw error;
    }

    console.log('✅ Persona created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in createPersona:', error);
    throw error;
  }
};

export const updatePersona = async (personaId: string, userId: string, personaData: Partial<Omit<PersonaData, 'id'>>) => {
  try {
    const updateData: any = {};

    if (personaData.name !== undefined) updateData.name = personaData.name;
    if (personaData.gender !== undefined) updateData.gender = personaData.gender;
    if (personaData.description !== undefined) updateData.description = personaData.description || null;
    if (personaData.applyToNewChats !== undefined) updateData.is_default = personaData.applyToNewChats;

    const { data, error } = await supabase
      .from('personas')
      .update(updateData)
      .eq('id', personaId)
      .eq('user_id', userId) // ✅ Security: Only update if user owns the persona
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating persona:', error);
      throw error;
    }

    console.log('✅ Persona updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in updatePersona:', error);
    throw error;
  }
};

export const deletePersona = async (personaId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', personaId)
      .eq('user_id', userId); // ✅ Security: Only delete if user owns the persona

    if (error) {
      console.error('❌ Error deleting persona:', error);
      throw error;
    }

    console.log('✅ Persona deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Final error in deletePersona:', error);
    throw error;
  }
};

export const getUserPersonas = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching personas:', error);
      throw error;
    }

    console.log('✅ Personas fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Final error in getUserPersonas:', error);
    return [];
  }
};

export const getDefaultPersona = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching default persona:', error);
      throw error;
    }

    console.log('✅ Default persona fetched:', data);
    return data || null;
  } catch (error) {
    console.error('❌ Final error in getDefaultPersona:', error);
    return null;
  }
};

export const setDefaultPersona = async (personaId: string, userId: string) => {
  try {
    // First, unset all other defaults for this user
    await supabase
      .from('personas')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the specified persona as default (only if user owns it)
    const { data, error } = await supabase
      .from('personas')
      .update({ is_default: true })
      .eq('id', personaId)
      .eq('user_id', userId) // ✅ Security: Only set default if user owns the persona
      .select()
      .single();

    if (error) {
      console.error('❌ Error setting default persona:', error);
      throw error;
    }

    console.log('✅ Default persona set successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in setDefaultPersona:', error);
    throw error;
  }
};

// Comments CRUD operations
export interface CommentWithAuthor {
  id: string;
  character_id: string;
  author_id: string | null;
  parent_id: string | null;
  content: string;
  likes_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    username?: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  is_liked?: boolean; // Added by client-side logic
  replies?: CommentWithAuthor[]; // For nested comments
}

export const getCommentsForCharacter = async (characterId: string, userId?: string | null): Promise<CommentWithAuthor[]> => {
  try {
    console.log('🔍 Fetching comments for character:', characterId);

    // First get all top-level comments (no parent_id)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:author_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('character_id', characterId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching comments:', error);
      throw error;
    }

    // If user is provided, check which comments they've liked
    let userLikes: string[] = [];
    if (userId) {
      const { data: likes, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId);

      if (!likesError && likes) {
        userLikes = likes.map(like => like.comment_id);
      }
    }

    // Add is_liked property to comments
    const commentsWithLikes = comments?.map(comment => ({
      ...comment,
      is_liked: userLikes.includes(comment.id)
    })) || [];

    console.log('✅ Comments fetched successfully:', commentsWithLikes.length);
    return commentsWithLikes;
  } catch (error) {
    console.error('❌ Final error in getCommentsForCharacter:', error);
    return [];
  }
};

export const addComment = async (
  characterId: string,
  content: string,
  authorId: string,
  parentId?: string | null
): Promise<CommentWithAuthor | null> => {
  try {
    console.log('💬 Adding comment:', { characterId, content, authorId, parentId });

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        character_id: characterId,
        content: content.trim(),
        author_id: authorId,
        parent_id: parentId || null
      })
      .select(`
        *,
        users:author_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }

    console.log('✅ Comment added successfully:', comment);
    return comment;
  } catch (error) {
    console.error('❌ Final error in addComment:', error);
    throw error;
  }
};

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    console.log('👍 Liking comment:', { commentId, userId });

    // Check if user already liked this comment
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing like:', checkError);
      throw checkError;
    }

    if (existingLike) {
      // Unlike: remove the like
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error removing like:', deleteError);
        throw deleteError;
      }

      console.log('✅ Comment unliked successfully');
      return false; // Now unliked
    } else {
      // Like: add the like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });

      if (insertError) {
        console.error('❌ Error adding like:', insertError);
        throw insertError;
      }

      console.log('✅ Comment liked successfully');
      return true; // Now liked
    }
  } catch (error) {
    console.error('❌ Final error in likeComment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting comment:', { commentId, userId });

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', userId); // Security: only delete own comments

    if (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }

    console.log('✅ Comment deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Final error in deleteComment:', error);
    throw error;
  }
};

export const getRepliesForComment = async (commentId: string, userId?: string | null): Promise<CommentWithAuthor[]> => {
  try {
    console.log('🔍 Fetching replies for comment:', commentId);

    const { data: replies, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:author_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true }); // Replies in chronological order

    if (error) {
      console.error('❌ Error fetching replies:', error);
      throw error;
    }

    // If user is provided, check which replies they've liked
    let userLikes: string[] = [];
    if (userId && replies && replies.length > 0) {
      const replyIds = replies.map(reply => reply.id);
      const { data: likes, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', replyIds);

      if (!likesError && likes) {
        userLikes = likes.map(like => like.comment_id);
      }
    }

    // Add is_liked property to replies
    const repliesWithLikes = replies?.map(reply => ({
      ...reply,
      is_liked: userLikes.includes(reply.id)
    })) || [];

    console.log('✅ Replies fetched successfully:', repliesWithLikes.length);
    return repliesWithLikes;
  } catch (error) {
    console.error('❌ Final error in getRepliesForComment:', error);
    return [];
  }
};

// Real-time subscription for comments
export const subscribeToComments = (
  characterId: string,
  onCommentAdded: (comment: CommentWithAuthor) => void,
  onCommentUpdated: (comment: CommentWithAuthor) => void,
  onCommentDeleted: (commentId: string) => void
) => {
  console.log('🔄 Setting up real-time subscription for comments on character:', characterId);

  const subscription = supabase
    .channel(`comments:${characterId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `character_id=eq.${characterId}`
      },
      async (payload) => {
        console.log('🆕 New comment received:', payload.new);

        // Fetch the complete comment with author info
        const { data: comment, error } = await supabase
          .from('comments')
          .select(`
            *,
            users:author_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && comment) {
          onCommentAdded(comment);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `character_id=eq.${characterId}`
      },
      async (payload) => {
        console.log('📝 Comment updated:', payload.new);

        // Fetch the complete updated comment with author info
        const { data: comment, error } = await supabase
          .from('comments')
          .select(`
            *,
            users:author_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && comment) {
          onCommentUpdated(comment);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `character_id=eq.${characterId}`
      },
      (payload) => {
        console.log('🗑️ Comment deleted:', payload.old);
        onCommentDeleted(payload.old.id);
      }
    )
    .subscribe();

  return subscription;
};

// Subscribe to comment likes changes
export const subscribeToCommentLikes = (
  commentIds: string[],
  onLikesChanged: (commentId: string, newLikesCount: number) => void
) => {
  console.log('👍 Setting up real-time subscription for comment likes:', commentIds);

  const subscription = supabase
    .channel('comment_likes_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, DELETE)
        schema: 'public',
        table: 'comment_likes'
      },
      async (payload) => {
        const commentId = payload.new?.comment_id || payload.old?.comment_id;

        if (commentId && commentIds.includes(commentId)) {
          // Fetch updated likes count for the comment
          const { data: comment, error } = await supabase
            .from('comments')
            .select('likes_count')
            .eq('id', commentId)
            .single();

          if (!error && comment) {
            onLikesChanged(commentId, comment.likes_count);
          }
        }
      }
    )
    .subscribe();

  return subscription;
};

// Favorites CRUD operations
export const favoriteCharacter = async (userId: string, characterId: string): Promise<boolean> => {
  try {
    console.log('❤️ Favoriting character:', { userId, characterId });

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorited')
      .select('id')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing favorite:', checkError);
      throw checkError;
    }

    if (existingFavorite) {
      // Unfavorite: remove the favorite
      const { error: deleteError } = await supabase
        .from('favorited')
        .delete()
        .eq('user_id', userId)
        .eq('character_id', characterId);

      if (deleteError) {
        console.error('❌ Error removing favorite:', deleteError);
        throw deleteError;
      }

      console.log('✅ Character unfavorited successfully');
      return false; // Now unfavorited
    } else {
      // Favorite: add the favorite
      const { error: insertError } = await supabase
        .from('favorited')
        .insert({
          user_id: userId,
          character_id: characterId
        });

      if (insertError) {
        console.error('❌ Error adding favorite:', insertError);
        throw insertError;
      }

      console.log('✅ Character favorited successfully');
      return true; // Now favorited
    }
  } catch (error) {
    console.error('❌ Final error in favoriteCharacter:', error);
    throw error;
  }
};

export const checkIsFavorited = async (userId: string, characterIds: string[]): Promise<string[]> => {
  try {
    if (characterIds.length === 0) return [];

    console.log('🔍 Checking favorited status for characters:', characterIds);

    const { data: favorites, error } = await supabase
      .from('favorited')
      .select('character_id')
      .eq('user_id', userId)
      .in('character_id', characterIds);

    if (error) {
      console.error('❌ Error checking favorites:', error);
      return [];
    }

    const favoritedIds = (favorites || []).map(fav => fav.character_id);
    console.log('�� Favorited character IDs:', favoritedIds);
    return favoritedIds;
  } catch (error) {
    console.error('❌ Final error in checkIsFavorited:', error);
    return [];
  }
};

export const getFavoriteCharacters = async (userId: string) => {
  try {
    console.log('📋 Fetching favorite characters for user:', userId);

    const { data: favoriteCharacters, error } = await supabase
      .from('favorited')
      .select(`
        created_at,
        characters!favorited_character_id_fkey(
          id,
          name,
          intro,
          avatar_url,
          tags,
          owner_id,
          visibility,
          rating,
          created_at,
          users!characters_owner_id_fkey(
            full_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching favorite characters:', error);
      throw error;
    }

    // Extract just the character data with favorite timestamp
    const characters = (favoriteCharacters || []).map(fav => ({
      ...fav.characters,
      favorited_at: fav.created_at
    })).filter(char => char.id); // Filter out any null characters

    console.log('✅ Favorite characters fetched successfully:', characters.length);
    return characters;
  } catch (error) {
    console.error('❌ Final error in getFavoriteCharacters:', error);
    return [];
  }
};

// Adventure Favorites CRUD operations
export const favoriteAdventure = async (userId: string, adventureId: string): Promise<boolean> => {
  try {
    console.log('❤️ Favoriting adventure:', { userId, adventureId });

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorited_adventures')
      .select('id')
      .eq('user_id', userId)
      .eq('adventure_id', adventureId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing adventure favorite:', checkError);
      throw checkError;
    }

    if (existingFavorite) {
      // Unfavorite: remove the favorite
      const { error: deleteError } = await supabase
        .from('favorited_adventures')
        .delete()
        .eq('user_id', userId)
        .eq('adventure_id', adventureId);

      if (deleteError) {
        console.error('❌ Error removing adventure favorite:', deleteError);
        throw deleteError;
      }

      console.log('✅ Adventure unfavorited successfully');
      return false; // Now unfavorited
    } else {
      // Favorite: add the favorite
      const { error: insertError } = await supabase
        .from('favorited_adventures')
        .insert({
          user_id: userId,
          adventure_id: adventureId
        });

      if (insertError) {
        console.error('❌ Error adding adventure favorite:', insertError);
        throw insertError;
      }

      console.log('✅ Adventure favorited successfully');
      return true; // Now favorited
    }
  } catch (error) {
    console.error('❌ Final error in favoriteAdventure:', error);
    throw error;
  }
};

export const checkAdventureIsFavorited = async (userId: string, adventureIds: string[]): Promise<string[]> => {
  try {
    if (adventureIds.length === 0) return [];

    console.log('🔍 Checking favorited status for adventures:', adventureIds);

    const { data: favorites, error } = await supabase
      .from('favorited_adventures')
      .select('adventure_id')
      .eq('user_id', userId)
      .in('adventure_id', adventureIds);

    if (error) {
      console.error('❌ Error checking adventure favorites:', error);
      return [];
    }

    const favoritedIds = (favorites || []).map(fav => fav.adventure_id);
    console.log('💜 Favorited adventure IDs:', favoritedIds);
    return favoritedIds;
  } catch (error) {
    console.error('❌ Final error in checkAdventureIsFavorited:', error);
    return [];
  }
};

export const getFavoriteAdventures = async (userId: string) => {
  try {
    console.log('📋 Fetching favorite adventures for user:', userId);

    const { data: favoriteAdventures, error } = await supabase
      .from('favorited_adventures')
      .select(`
        created_at,
        adventures!favorited_adventures_adventure_id_fkey(
          id,
          name,
          plot,
          adventure_image_url,
          category,
          rating,
          owner_id,
          visibility,
          created_at,
          users!adventures_owner_id_fkey(
            full_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching favorite adventures:', error);
      throw error;
    }

    // Extract just the adventure data with favorite timestamp
    const adventures = (favoriteAdventures || []).map(fav => ({
      ...fav.adventures,
      favorited_at: fav.created_at
    })).filter(adv => adv.id); // Filter out any null adventures

    console.log('✅ Favorite adventures fetched successfully:', adventures.length);
    return adventures;
  } catch (error) {
    console.error('❌ Final error in getFavoriteAdventures:', error);
    return [];
  }
};

// Adventure Conversation and Message CRUD operations
export const createAdventureConversation = async (
  userId: string,
  adventureId: string,
  personaId?: string | null,
  title?: string | null
) => {
  try {
    console.log('🎭 Creating adventure conversation:', { userId, adventureId, personaId, title });

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        adventure_id: adventureId,
        persona_id: personaId ?? null,
        title: title ?? null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating adventure conversation:', error);
      throw error;
    }

    console.log('✅ Adventure conversation created successfully:', conversation);
    return conversation;
  } catch (error) {
    console.error('❌ Final error in createAdventureConversation:', error);
    throw error;
  }
};

export const getAdventureConversation = async (conversationId: string) => {
  try {
    console.log('🔍 Fetching adventure conversation:', conversationId);

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('❌ Error fetching adventure conversation:', error);
      throw error;
    }

    console.log('✅ Adventure conversation fetched successfully:', conversation);
    return conversation;
  } catch (error) {
    console.error('❌ Final error in getAdventureConversation:', error);
    throw error;
  }
};

export const getUserAdventureConversations = async (userId: string) => {
  try {
    console.log('📋 Fetching user adventure conversations:', userId);

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .not('adventure_id', 'is', null)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user adventure conversations:', error);
      throw error;
    }

    console.log('✅ User adventure conversations fetched successfully:', conversations?.length || 0);
    return conversations || [];
  } catch (error) {
    console.error('❌ Final error in getUserAdventureConversations:', error);
    return [];
  }
};

export const addAdventureMessage = async (
  adventureId: string,
  conversationId: string | null,
  content: string,
  isBot: boolean,
  userId?: string | null,
  type: 'intro' | 'scenario' | 'regular' | 'choice' = 'regular'
) => {
  try {
    console.log('💬 Adding adventure message:', {
      adventureId,
      conversationId,
      isBot,
      type
    });

    const payload: any = {
      adventure_id: adventureId,
      conversation_id: conversationId,
      content,
      is_bot: isBot,
      type
    };
    if (!isBot && userId) payload.author_id = userId;

    const { data: message, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding adventure message:', error);
      throw error;
    }

    console.log('✅ Adventure message added successfully:', message);
    return message;
  } catch (error) {
    console.error('❌ Final error in addAdventureMessage:', error);
    throw error;
  }
};

export const getAdventureMessages = async (conversationId: string) => {
  try {
    console.log('🔍 Fetching adventure messages for conversation:', conversationId);

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching adventure messages:', error);
      throw error;
    }

    console.log('✅ Adventure messages fetched successfully:', messages?.length || 0);
    return messages || [];
  } catch (error) {
    console.error('❌ Final error in getAdventureMessages:', error);
    return [];
  }
};

export const deleteAdventureConversation = async (conversationId: string, userId: string) => {
  try {
    console.log('🗑️ Deleting adventure conversation:', conversationId);

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId); // Security: only delete own conversations

    if (error) {
      console.error('❌ Error deleting adventure conversation:', error);
      throw error;
    }

    console.log('✅ Adventure conversation deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Final error in deleteAdventureConversation:', error);
    throw error;
  }
};

export const updateAdventureConversationTitle = async (
  conversationId: string,
  userId: string,
  title: string
) => {
  try {
    console.log('📝 Updating adventure conversation title:', { conversationId, title });

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', userId) // Security: only update own conversations
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating adventure conversation title:', error);
      throw error;
    }

    console.log('✅ Adventure conversation title updated successfully:', conversation);
    return conversation;
  } catch (error) {
    console.error('❌ Final error in updateAdventureConversationTitle:', error);
    throw error;
  }
};

// Chat Settings CRUD operations
export interface ChatSettings {
  id?: string;
  user_id: string;
  model_id: string;
  temperature: number;
  content_diversity: number;
  max_tokens: number;
  created_at?: string;
  updated_at?: string;
}

export const getChatSettings = async (userId: string, modelId: string): Promise<ChatSettings | null> => {
  try {
    console.log('🔍 Fetching chat settings for user and model:', { userId, modelId });

    const { data: settings, error } = await supabase
      .from('chat_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('model_id', modelId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching chat settings:', error);
      throw error;
    }

    console.log('✅ Chat settings fetched:', settings);
    return settings || null;
  } catch (error) {
    console.error('❌ Final error in getChatSettings:', error);
    return null;
  }
};

export const saveChatSettings = async (settings: Omit<ChatSettings, 'id' | 'created_at' | 'updated_at'>): Promise<ChatSettings | null> => {
  try {
    console.log('💾 Saving chat settings:', settings);

    const { data: savedSettings, error } = await supabase
      .from('chat_settings')
      .upsert(settings, {
        onConflict: 'user_id,model_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving chat settings:', error);
      throw error;
    }

    console.log('✅ Chat settings saved successfully:', savedSettings);
    return savedSettings;
  } catch (error) {
    console.error('❌ Final error in saveChatSettings:', error);
    throw error;
  }
};

export const getDefaultChatSettings = (): Omit<ChatSettings, 'id' | 'user_id' | 'model_id' | 'created_at' | 'updated_at'> => {
  return {
    temperature: 0.70,
    content_diversity: 0.05,
    max_tokens: 195
  };
};
