
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
  return getUserContentLevel() === 'sfw';
};

// Check if moderate NSFW content should be limited
export const shouldLimitNSFWContent = (): boolean => {
  const level = getUserContentLevel();
  return level === 'sfw' || level === 'moderate';
};

// Get appropriate error message for blocked content
export const getNSFWBlockMessage = (): string => {
  const level = getUserContentLevel();
  if (level === 'sfw') {
    return "I cannot assist with this request as it contains adult content that is not appropriate for your age group.";
  }
  return "This content has been filtered based on your preferences.";
};

// Update user content preferences
export const updateUserContentLevel = (ageRange: string) => {
  let contentLevel: ContentLevel;
  
  if (ageRange === 'below-18') {
    contentLevel = 'sfw';
  } else if (ageRange === '18-20') {
    contentLevel = 'moderate';
  } else {
    contentLevel = 'unrestricted';
  }
  
  try {
    localStorage.setItem('user_content_level', contentLevel);
    localStorage.setItem('user_age_range', ageRange);
  } catch (error) {
    console.error('Error updating content level:', error);
  }
  
  return contentLevel;
};

// Direct content level setter
export const setUserContentLevel = (contentLevel: ContentLevel) => {
  try {
    localStorage.setItem('user_content_level', contentLevel);
    // Map content level back to age range for consistency
    const ageRange = contentLevel === 'sfw' ? 'below-18' : 
                     contentLevel === 'moderate' ? '18-20' : '21+';
    localStorage.setItem('user_age_range', ageRange);
  } catch (error) {
    console.error('Error setting content level:', error);
  }
  
  return contentLevel;
};
