import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (val?: string) => !val || val.startsWith('REPLACE_ENV') || val === 'REPLACE_ENV.VITE_SUPABASE_URL' || val === 'REPLACE_ENV.VITE_SUPABASE_ANON_KEY';

const isValidUrl = (u?: string) => {
  if (!u) return false;
  try {
    // URL constructor will throw for invalid URLs
    // eslint-disable-next-line no-new
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey) || !isValidUrl(supabaseUrl)) {
  throw new Error('Missing or invalid Supabase environment variables. Ensure VITE_SUPABASE_URL is a valid URL and VITE_SUPABASE_ANON_KEY is provided.');
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
          coins: number; // Whisper coins balance
          invite_code: string; // Unique invite code for this user
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
          coins?: number; // Whisper coins balance
          invite_code?: string; // Unique invite code for this user
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
          coins?: number; // Whisper coins balance
          invite_code?: string; // Unique invite code for this user
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
      invites: {
        Row: {
          id: string;
          inviter_id: string; // User who created the invite code
          invitee_id: string; // User who used the invite code
          invite_code: string; // The invite code that was used
          coins_awarded: number; // Coins awarded for this invite (usually 100)
          created_at: string;
        };
        Insert: {
          id?: string;
          inviter_id: string;
          invitee_id: string;
          invite_code: string;
          coins_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          inviter_id?: string;
          invitee_id?: string;
          invite_code?: string;
          coins_awarded?: number;
          created_at?: string;
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

// Helper function to get the best available display name for a user
export const getUserDisplayName = async (clerkUser: any): Promise<string> => {
  if (!clerkUser) return 'User';

  try {
    // First, try to get the user from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', clerkUser.id)
      .single();

    if (!error && userData) {
      // Return the best available name from Supabase
      return userData.full_name || userData.username || clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
    }
  } catch (error) {
    console.warn('⚠️ Could not load user from Supabase, using Clerk data:', error);
  }

  // Fallback to Clerk user data
  return clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
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
    const insertPayload = {
      user_id: userId,
      name: personaData.name,
      gender: personaData.gender,
      description: personaData.description || null,
      is_default: personaData.applyToNewChats
    };

    // Try regular insert with select
    const { data, error } = await supabase
      .from('personas')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating persona:', error);
      // Fallback for RLS/permission issues when selecting after insert
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('permission') || error.message?.toLowerCase().includes('rls')) {
        const { error: retryError } = await supabase
          .from('personas')
          .insert(insertPayload);
        if (!retryError) {
          console.log('✅ Persona inserted without select (fallback).');
          return insertPayload as any;
        }
        console.error('❌ Persona insert fallback failed:', retryError);
        throw retryError;
      }
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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating persona:', error);
      // Fallback when select after update is blocked by RLS/permissions
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('permission') || error.message?.toLowerCase().includes('rls')) {
        const { error: retryError } = await supabase
          .from('personas')
          .update(updateData)
          .eq('id', personaId)
          .eq('user_id', userId);
        if (!retryError) {
          console.log('✅ Persona updated without select (fallback).');
          return { id: personaId, user_id: userId, ...updateData } as any;
        }
        console.error('❌ Persona update fallback failed:', retryError);
        throw retryError;
      }
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
        console.log('����️ Comment deleted:', payload.old);
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
    console.log('🔍 Checking favorited status for characters (RPC):', characterIds);
    const { data, error } = await supabase.rpc('check_favorited', { p_user_id: userId, p_character_ids: characterIds });
    if (error) {
      console.error('❌ Error checking favorites via RPC:', error);
      return [];
    }
    const ids = (data || []).map((r: any) => r.character_id);
    return ids;
  } catch (error) {
    console.error('❌ Final error in checkIsFavorited (RPC):', error);
    return [];
  }
};

export const getFavoriteCharacters = async (userId: string) => {
  try {
    console.log('📋 Fetching favorite characters for user (RPC):', userId);
    const { data, error } = await supabase.rpc('get_favorite_characters', { p_user_id: userId });
    if (error) {
      console.error('❌ Error fetching favorite characters via RPC:', error);
      return [];
    }
    const characters = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      intro: row.intro,
      avatar_url: row.avatar_url,
      tags: row.tags,
      owner_id: row.owner_id,
      visibility: row.visibility,
      rating: row.rating,
      created_at: row.created_at,
      favorited_at: row.favorited_at
    })).filter((c: any) => c.id);
    console.log('✅ Favorite characters fetched successfully (RPC):', characters.length);
    return characters;
  } catch (error) {
    console.error('❌ Final error in getFavoriteCharacters (RPC):', error);
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

// Whisper Coins Management Functions
export const getUserCoins = async (userId: string): Promise<number> => {
  try {
    console.log('🪙 Fetching user coins for:', userId);

    const { data, error } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user coins:', error);
      // If user doesn't exist, return 0 (they'll be created when they earn coins)
      if (error.code === 'PGRST116') {
        return 0;
      }
      throw error;
    }

    const coins = data?.coins ?? 0;
    console.log('✅ User coins fetched:', coins);
    return coins;
  } catch (error) {
    console.error('❌ Final error in getUserCoins:', error);
    return 0;
  }
};

export const incrementUserCoins = async (userId: string, amount: number, reason: string = 'coins_earned'): Promise<number> => {
  try {
    console.log('💰 Incrementing user coins:', { userId, amount, reason });

    // Ensure a user row exists (minimal upsert to avoid circular deps)
    const { error: upsertErr } = await supabase
      .from('users')
      .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (upsertErr) console.warn('⚠️ Could not ensure user exists before coin increment:', upsertErr);

    // Use a database function for atomic increment if available
    const { data, error } = await supabase.rpc('increment_user_coins', {
      user_id: userId,
      coin_amount: amount,
      transaction_reason: reason
    });

    if (error) {
      console.error('❌ RPC increment failed, trying direct update:', error);

      // Fallback to direct update if RPC doesn't exist
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();

      // If user still doesn't exist, create with starting balance
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .insert({ id: userId, coins: amount, updated_at: new Date().toISOString() })
          .select('coins')
          .single();
        if (insertErr) throw insertErr;
        console.log('✅ User created and coins set (fallback):', inserted.coins);
        return inserted.coins;
      }

      if (fetchError) {
        console.error('❌ Error fetching current coins:', fetchError);
        throw fetchError;
      }

      const currentCoins = currentUser?.coins ?? 0;
      const newCoins = currentCoins + amount;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ coins: newCoins, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('coins')
        .single();

      if (updateError) {
        console.error('❌ Error updating user coins:', updateError);
        throw updateError;
      }

      console.log('✅ User coins incremented (fallback):', updatedUser.coins);
      return updatedUser.coins;
    }

    console.log('✅ User coins incremented via RPC:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in incrementUserCoins:', error);
    throw error;
  }
};

export const deductUserCoins = async (userId: string, amount: number, reason: string = 'coins_spent'): Promise<number> => {
  try {
    console.log('💸 Deducting user coins:', { userId, amount, reason });

    // Check current balance first
    const currentCoins = await getUserCoins(userId);
    if (currentCoins < amount) {
      throw new Error(`Insufficient coins. Current: ${currentCoins}, Required: ${amount}`);
    }

    // Use a database function for atomic deduction
    const { data, error } = await supabase.rpc('deduct_user_coins', {
      user_id: userId,
      coin_amount: amount,
      transaction_reason: reason
    });

    if (error) {
      console.error('❌ RPC deduction failed, trying direct update:', error);

      // Fallback to direct update if RPC doesn't exist
      const newCoins = currentCoins - amount;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', userId)
        .select('coins')
        .single();

      if (updateError) {
        console.error('❌ Error updating user coins:', updateError);
        throw updateError;
      }

      console.log('✅ User coins deducted (fallback):', updatedUser.coins);
      return updatedUser.coins;
    }

    console.log('✅ User coins deducted via RPC:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in deductUserCoins:', error);
    throw error;
  }
};

// Migrate localStorage coins to database (one-time migration)
export const migrateLocalStorageCoins = async (userId: string): Promise<void> => {
  try {
    const COIN_KEY = "bonus:coins";
    const localCoins = Number(localStorage.getItem(COIN_KEY) || 0);

    if (localCoins > 0) {
      console.log('🔄 Migrating localStorage coins to database:', localCoins);

      // Add the localStorage coins to the user's database balance
      await incrementUserCoins(userId, localCoins, 'localStorage_migration');

      // Clear localStorage to prevent double migration
      localStorage.removeItem(COIN_KEY);

      console.log('✅ localStorage coins migrated successfully');
    }
  } catch (error) {
    console.error('❌ Error migrating localStorage coins:', error);
    // Don't throw error to avoid breaking the app - migration is optional
  }
};

// Check if user can claim daily reward
export const canClaimDailyReward = async (userId: string, rewardType: 'checkin' | 'conversation'): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('claim_type', rewardType)
      .eq('claim_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking daily claim:', error);
      return false;
    }

    // If no record found (PGRST116), user can claim
    return !data;
  } catch (error) {
    console.error('Error checking daily claim:', error);
    return false;
  }
};

// Mark daily reward as claimed
export const markDailyRewardClaimed = async (userId: string, rewardType: 'checkin' | 'conversation', coinsAwarded: number): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_claims')
      .insert({
        user_id: userId,
        claim_type: rewardType,
        claim_date: today,
        coins_awarded: coinsAwarded
      });

    if (error) {
      console.error('Error marking daily claim:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking daily claim:', error);
    return false;
  }
};

// Get user's daily claim status for today
export const getDailyClaimStatus = async (userId: string): Promise<{checkin: boolean, conversation: boolean}> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_claims')
      .select('claim_type')
      .eq('user_id', userId)
      .eq('claim_date', today);

    if (error) {
      console.error('Error getting daily claim status:', error);
      return { checkin: false, conversation: false };
    }

    const claimedTypes = data?.map(claim => claim.claim_type) || [];
    return {
      checkin: claimedTypes.includes('checkin'),
      conversation: claimedTypes.includes('conversation')
    };
  } catch (error) {
    console.error('Error getting daily claim status:', error);
    return { checkin: false, conversation: false };
  }
};

// Invite System Functions
export interface InviteStats {
  invite_code: string;
  invites_used: number;
  max_invites: number;
}

export const getUserInviteStats = async (userId: string): Promise<InviteStats> => {
  try {
    console.log('📊 Fetching invite stats for user:', userId);

    const { data, error } = await supabase.rpc('get_invite_stats', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error fetching invite stats:', error);
      throw error;
    }

    // RPC returns an array, get the first item
    const stats = data && data.length > 0 ? data[0] : {
      invite_code: '',
      invites_used: 0,
      max_invites: 10
    };

    console.log('✅ Invite stats fetched:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Final error in getUserInviteStats:', error);
    // Return default stats on error
    return {
      invite_code: '',
      invites_used: 0,
      max_invites: 10
    };
  }
};

export const processInviteCode = async (inviteeId: string, inviteCode: string): Promise<{success: boolean, message: string, coinsAwarded?: number}> => {
  try {
    console.log('🎫 Processing invite code:', { inviteeId, inviteCode });

    const { data, error } = await supabase.rpc('process_invite_code_usage', {
      p_invitee_id: inviteeId,
      p_invite_code: inviteCode
    });

    if (error) {
      console.error('�� Error processing invite code:', error);
      return { success: false, message: 'Failed to process invite code' };
    }

    const result = data && data.length > 0 ? data[0] : null;

    if (!result || !result.success) {
      if (!result || !result.inviter_id) {
        return { success: false, message: 'Invalid invite code' };
      } else if (result.coins_awarded === 0) {
        return { success: false, message: 'Invite code limit reached or already used' };
      } else {
        return { success: false, message: 'Failed to process invite' };
      }
    }

    console.log('✅ Invite code processed successfully:', result);
    return {
      success: true,
      message: `Invite processed! ${result.coins_awarded} coins awarded to inviter.`,
      coinsAwarded: result.coins_awarded
    };
  } catch (error) {
    console.error('❌ Final error in processInviteCode:', error);
    return { success: false, message: 'An error occurred while processing the invite code' };
  }
};

export const generateInviteCode = async (): Promise<string> => {
  try {
    console.log('🔗 Generating new invite code');

    const { data, error } = await supabase.rpc('generate_invite_code');

    if (error) {
      console.error('❌ Error generating invite code:', error);
      throw error;
    }

    console.log('✅ Invite code generated:', data);
    return data || '';
  } catch (error) {
    console.error('❌ Final error in generateInviteCode:', error);
    // Fallback to simple random code generation
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

export const ensureUserHasInviteCode = async (userId: string): Promise<string> => {
  try {
    console.log('🔍 Ensuring user has invite code:', userId);

    // First check if user already has an invite code
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('invite_code')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching user invite code:', fetchError);
      throw fetchError;
    }

    // If user already has an invite code, return it
    if (user?.invite_code) {
      console.log('✅ User already has invite code:', user.invite_code);
      return user.invite_code;
    }

    // Generate a new invite code
    const newInviteCode = await generateInviteCode();

    // Update user with the new invite code
    const { error: updateError } = await supabase
      .from('users')
      .update({ invite_code: newInviteCode })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating user invite code:', updateError);
      throw updateError;
    }

    console.log('✅ New invite code assigned to user:', newInviteCode);
    return newInviteCode;
  } catch (error) {
    console.error('❌ Final error in ensureUserHasInviteCode:', error);
    // Return a fallback code if everything fails
    return 'ERROR_CODE';
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

// Batch fetch message counts for characters
export const getMessageCountsForCharacters = async (characterIds: string[]): Promise<Record<string, number>> => {
  if (!characterIds || characterIds.length === 0) return {};
  try {
    const { data, error } = await supabase.rpc('get_message_counts', { character_ids: characterIds });
    if (error) {
      console.error('Error fetching message counts via RPC:', error);
      return {};
    }
    const map: Record<string, number> = {};
    for (const row of data || []) {
      if (row && row.character_id) map[row.character_id] = Number(row.cnt) || 0;
    }
    return map;
  } catch (err) {
    console.error('Final error in getMessageCountsForCharacters:', err);
    return {};
  }
};

// Batch fetch favorite counts for characters
export const getFavoriteCountsForCharacters = async (characterIds: string[]): Promise<Record<string, number>> => {
  if (!characterIds || characterIds.length === 0) return {};
  try {
    const { data, error } = await supabase.rpc('get_favorite_counts', { character_ids: characterIds });
    if (error) {
      console.error('Error fetching favorite counts via RPC:', error);
      return {};
    }
    const map: Record<string, number> = {};
    for (const row of data || []) {
      if (row && row.character_id) map[row.character_id] = Number(row.cnt) || 0;
    }
    return map;
  } catch (err) {
    console.error('Final error in getFavoriteCountsForCharacters:', err);
    return {};
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

// Chat Settings for UI components
export interface ChatSettings {
  user_id: string;
  model_id: string;
  temperature: number;
  content_diversity: number;
  max_tokens: number;
}

export const getDefaultChatSettings = (): Pick<ChatSettings, 'temperature' | 'content_diversity' | 'max_tokens'> => {
  return {
    temperature: 0.70,
    content_diversity: 0.05,
    max_tokens: 195
  };
};
