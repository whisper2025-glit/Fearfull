// Content filtering utilities based on user age preferences

export type ContentLevel = 'sfw' | 'moderate' | 'unrestricted';

export interface UserPreferences {
  age_range: string;
  nsfw_level: ContentLevel;
  pronoun?: string;
  relationship_preference?: string;
}

// Get content level from local storage or user preferences
export const getUserContentLevel = (): ContentLevel => {
  try {
    const stored = localStorage.getItem('user_content_level');
    if (stored && ['sfw', 'moderate', 'unrestricted'].includes(stored)) {
      return stored as ContentLevel;
    }

    const ageRange = localStorage.getItem('user_age_range');
    if (ageRange === 'below-18') return 'sfw';
    if (ageRange === '18-20') return 'moderate';
    return 'unrestricted';
  } catch {
    return 'unrestricted'; // Default for safety
  }
};

// Check if user has completed onboarding
export const hasCompletedOnboarding = (): boolean => {
  try {
    return localStorage.getItem('user_content_level') !== null;
  } catch {
    return false;
  }
};

// Filter characters based on user's content level
export const filterCharactersByContentLevel = (characters: any[], contentLevel: ContentLevel = getUserContentLevel()) => {
  if (contentLevel === 'unrestricted') {
    return characters; // Show ALL characters including extreme/taboo content
  }

  if (contentLevel === 'sfw') {
    // Only show filtered/safe characters for under 18
    return characters.filter(char => 
      !char.rating || char.rating === 'filtered' || char.rating === 'sfw'
    );
  }

  if (contentLevel === 'moderate') {
    // Show most characters but filter extreme content for 18-20
    return characters.filter(char => 
      !char.rating || char.rating !== 'extreme'
    );
  }

  return characters;
};

// Check if NSFW content should be blocked for current user
export const shouldBlockNSFWContent = (): boolean => {
  const level = getUserContentLevel();
  return level === 'sfw';
};

export const getNSFWBlockMessage = (): string => {
  return "I can't engage with that type of content. Let's talk about something else!";
};

export const setUserContentLevel = (level: ContentLevel): void => {
  localStorage.setItem('user_content_level', level);
  console.log(`🔒 Content level set to: ${level}`);
};