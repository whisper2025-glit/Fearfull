// Mock Supabase client - all database functionality removed
// This file maintains type definitions and exports to prevent import errors

// Mock supabase client export to prevent import errors
export const supabase: any = new Proxy({}, {
  get() {
    console.warn('Supabase functionality has been removed from this application');
    return () => Promise.resolve({ data: null, error: new Error('Supabase functionality disabled') });
  }
});

// Mock configuration check
export const hasSupabaseEnv = () => false;

// Database types (kept for compatibility)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username?: string | null;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          gender: string | null;
          coins: number;
          invite_code: string;
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
          coins?: number;
          invite_code?: string;
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
          coins?: number;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          owner_id: string;
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
          user_id: string;
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
          user_id: string;
          character_id: string;
          persona_id: string | null;
          title: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          is_archived: boolean;
          metadata: any;
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
          conversation_id: string | null;
          author_id: string | null;
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
      };
      comments: {
        Row: {
          id: string;
          character_id: string;
          author_id: string | null;
          parent_id: string | null;
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
          user_id: string;
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
          user_id: string;
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
          user_id: string;
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
          owner_id: string;
          name: string;
          plot: string;
          introduction: string | null;
          adventure_image_url: string | null;
          background_image_url: string | null;
          adventure_type: 'mcp' | 'custom';
          source_story: string | null;
          mcp_settings: string | null;
          custom_settings: string | null;
          ai_instructions: string | null;
          story_summary: string | null;
          plot_essentials: string | null;
          story_cards: any | null;
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
          user_id: string;
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
          user_id: string;
          adventure_id: string;
          persona_id: string | null;
          title: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          is_archived: boolean;
          metadata: any;
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
          inviter_id: string;
          invitee_id: string;
          invite_code: string;
          coins_awarded: number;
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
          user_id: string | null;
          content: string;
          is_bot: boolean;
          type: 'intro' | 'scenario' | 'regular' | 'choice';
          choices: any[];
          metadata: any;
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
}

// Mock function exports to prevent import errors
export const setSupabaseAuth = async () => Promise.resolve();

// Mock helper functions
export const uploadImage = async () => Promise.reject(new Error('Database functionality disabled'));
export const createConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const deleteConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const clearMessagesForConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const clearMessagesForUserCharacter = async () => Promise.reject(new Error('Database functionality disabled'));
export const getUserDisplayName = async () => 'User';

// Persona interface and mock functions
export interface PersonaData {
  id?: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  description: string;
  applyToNewChats: boolean;
}

export const createPersona = async () => Promise.reject(new Error('Database functionality disabled'));
export const updatePersona = async () => Promise.reject(new Error('Database functionality disabled'));
export const deletePersona = async () => Promise.reject(new Error('Database functionality disabled'));
export const getUserPersonas = async () => Promise.resolve([]);
export const getDefaultPersona = async () => Promise.resolve(null);
export const setDefaultPersona = async () => Promise.reject(new Error('Database functionality disabled'));

// Comments interface and mock functions
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
  is_liked?: boolean;
  replies?: CommentWithAuthor[];
}

export const getCommentsForCharacter = async () => Promise.resolve([]);
export const addComment = async () => Promise.reject(new Error('Database functionality disabled'));
export const likeComment = async () => Promise.reject(new Error('Database functionality disabled'));
export const deleteComment = async () => Promise.reject(new Error('Database functionality disabled'));
export const getRepliesForComment = async () => Promise.resolve([]);
export const subscribeToComments = () => ({ unsubscribe: () => {} });
export const subscribeToCommentLikes = () => ({ unsubscribe: () => {} });

// Favorites mock functions
export const favoriteCharacter = async () => Promise.reject(new Error('Database functionality disabled'));
export const checkIsFavorited = async () => Promise.resolve([]);
export const getFavoriteCharacters = async () => Promise.resolve([]);
export const favoriteAdventure = async () => Promise.reject(new Error('Database functionality disabled'));
export const checkAdventureIsFavorited = async () => Promise.resolve([]);
export const getFavoriteAdventures = async () => Promise.resolve([]);

// Coins mock functions
export const getUserCoins = async () => Promise.resolve(0);
export const incrementUserCoins = async () => Promise.reject(new Error('Database functionality disabled'));
export const deductUserCoins = async () => Promise.reject(new Error('Database functionality disabled'));
export const migrateLocalStorageCoins = async () => Promise.resolve();
export const canClaimDailyReward = async () => Promise.resolve(false);
export const markDailyRewardClaimed = async () => Promise.resolve(false);
export const getDailyClaimStatus = async () => Promise.resolve({ checkin: false, conversation: false });

// User Instructions interface and mock functions
export type UserInstructions = {
  user_id: string;
  dont_refuse: boolean;
  reduce_repetition: boolean;
  custom_text: string;
};

export const getUserInstructions = async () => Promise.resolve(null);
export const upsertUserInstructions = async () => Promise.resolve(null);

// Invite System interface and mock functions
export interface InviteStats {
  invite_code: string;
  invites_used: number;
  max_invites: number;
}

export const getUserInviteStats = async () => Promise.resolve({
  invite_code: '',
  invites_used: 0,
  max_invites: 10
});
export const processInviteCode = async () => Promise.resolve({ success: false, message: 'Database functionality disabled' });
export const generateInviteCode = async () => Promise.resolve('DISABLED');
export const ensureUserHasInviteCode = async () => Promise.resolve('DISABLED');

// Adventure mock functions
export const createAdventureConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const getAdventureConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const getUserAdventureConversations = async () => Promise.resolve([]);
export const addAdventureMessage = async () => Promise.reject(new Error('Database functionality disabled'));
export const getMessageCountsForCharacters = async () => Promise.resolve({});
export const getFavoriteCountsForCharacters = async () => Promise.resolve({});
export const getAdventureMessages = async () => Promise.resolve([]);
export const deleteAdventureConversation = async () => Promise.reject(new Error('Database functionality disabled'));
export const updateAdventureConversationTitle = async () => Promise.reject(new Error('Database functionality disabled'));

// Chat Settings interface and mock functions
export interface ChatSettings {
  user_id: string;
  model_id: string;
  temperature: number;
  content_diversity: number;
  max_tokens: number;
}

export const getDefaultChatSettings = (): Pick<ChatSettings, 'temperature' | 'content_diversity' | 'max_tokens'> => ({
  temperature: 0.70,
  content_diversity: 0.05,
  max_tokens: 195
});

export const saveChatSettings = async () => Promise.reject(new Error('Database functionality disabled'));
export const getChatSettings = async () => Promise.resolve(null);
