/**
 * Action complexity validator for roleplay responses
 * Ensures only complex, detailed, passionate actions are used
 */

export interface ActionValidationResult {
  isValid: boolean;
  reason?: string;
  suggestion?: string;
}

// List of forbidden simple actions
const FORBIDDEN_SIMPLE_ACTIONS = [
  'waves', 'smiles', 'nods', 'shrugs', 'laughs', 'sighs', 'winks',
  'looks', 'sits', 'stands', 'walks', 'runs', 'stops', 'turns',
  'blushes', 'giggles', 'grins', 'frowns', 'yawns', 'sleeps',
  'eats', 'drinks', 'reads', 'writes', 'types', 'clicks',
  'opens', 'closes', 'enters', 'exits', 'arrives', 'leaves',
  'happy', 'sad', 'angry', 'surprised', 'confused', 'excited',
  'tired', 'bored', 'worried', 'scared', 'calm', 'relaxed'
];

// Words that indicate simple actions
const SIMPLE_ACTION_INDICATORS = [
  'quickly', 'slowly', 'gently', 'softly', 'loudly', 'quietly',
  'suddenly', 'briefly', 'simply', 'just', 'only', 'barely'
];

/**
 * Validates if an action is complex enough for roleplay
 * @param action The action text (without asterisks)
 * @returns Validation result with feedback
 */
export function validateActionComplexity(action: string): ActionValidationResult {
  const trimmedAction = action.trim().toLowerCase();
  
  // Check minimum word count (must be at least 8 words)
  const wordCount = trimmedAction.split(/\s+/).length;
  if (wordCount < 8) {
    return {
      isValid: false,
      reason: 'Action too short - must be at least 8 words',
      suggestion: 'Add emotional depth, sensory details, or complex movements'
    };
  }

  // Check for forbidden simple actions
  for (const forbidden of FORBIDDEN_SIMPLE_ACTIONS) {
    if (trimmedAction.includes(forbidden)) {
      return {
        isValid: false,
        reason: `Contains forbidden simple action: "${forbidden}"`,
        suggestion: 'Replace with detailed, emotional, or passionate description'
      };
    }
  }

  // Check for simple action indicators that suggest lack of complexity
  const simpleIndicatorCount = SIMPLE_ACTION_INDICATORS.filter(
    indicator => trimmedAction.includes(indicator)
  ).length;
  
  if (simpleIndicatorCount > 2 && wordCount < 12) {
    return {
      isValid: false,
      reason: 'Action appears too simple despite length',
      suggestion: 'Add emotional complexity, sensory details, or passionate elements'
    };
  }

  // Check for emotional/passionate keywords (positive indicators)
  const complexityKeywords = [
    'passion', 'desire', 'emotion', 'intensity', 'trembling', 'breathing',
    'heart', 'soul', 'tears', 'whisper', 'caress', 'touch', 'embrace',
    'yearning', 'longing', 'desperate', 'overwhelming', 'profound',
    'gentle', 'tender', 'fierce', 'burning', 'aching', 'melting'
  ];

  const hasComplexityKeywords = complexityKeywords.some(
    keyword => trimmedAction.includes(keyword)
  );

  // Check for sensory details
  const sensoryKeywords = [
    'feel', 'touch', 'see', 'hear', 'taste', 'smell', 'warm', 'cool',
    'soft', 'rough', 'smooth', 'sweet', 'bitter', 'bright', 'dark'
  ];

  const hasSensoryDetails = sensoryKeywords.some(
    keyword => trimmedAction.includes(keyword)
  );

  // Action is valid if it has complexity keywords, sensory details, or is very long
  if (hasComplexityKeywords || hasSensoryDetails || wordCount >= 15) {
    return { isValid: true };
  }

  return {
    isValid: false,
    reason: 'Lacks emotional depth or sensory details',
    suggestion: 'Add passionate elements, emotions, or detailed descriptions'
  };
}

/**
 * Filters text to remove or enhance simple actions
 * @param text The full message text
 * @returns Enhanced text with complex actions only
 */
export function enhanceSimpleActions(text: string): string {
  // Use regex to find and validate all actions
  const actionRegex = /\*([^*]+?)\*/g;
  
  return text.replace(actionRegex, (match, actionContent) => {
    const validation = validateActionComplexity(actionContent);
    
    if (validation.isValid) {
      return match; // Keep the action as is
    }
    
    // For simple actions, try to enhance them or remove them
    const enhanced = enhanceSimpleAction(actionContent);
    return enhanced ? `*${enhanced}*` : ''; // Remove if can't enhance
  });
}

/**
 * Attempts to enhance a simple action into a complex one
 * @param simpleAction The simple action to enhance
 * @returns Enhanced action or null if cannot enhance
 */
function enhanceSimpleAction(simpleAction: string): string | null {
  const trimmed = simpleAction.trim().toLowerCase();
  
  // Enhancement mappings for common simple actions
  const enhancements: Record<string, string> = {
    'waves': 'raises her hand in a graceful arc, fingers dancing through the air with elegant purpose',
    'smiles': 'lips curve upward in a warm expression that lights up her entire face with genuine affection',
    'nods': 'tilts her head forward in acknowledgment, eyes bright with understanding and agreement',
    'laughs': 'releases a melodic sound of pure joy that seems to bubble up from deep within her soul',
    'sighs': 'exhales slowly, the breath carrying the weight of unspoken emotions and hidden thoughts',
    'looks': 'turns her gaze with deliberate intention, eyes searching and filled with curious intensity',
    'blushes': 'feels warmth spreading across her cheeks as color rises to paint her skin with embarrassment'
  };

  // Try direct enhancement first
  for (const [simple, complex] of Object.entries(enhancements)) {
    if (trimmed.includes(simple)) {
      return complex;
    }
  }

  // If no direct enhancement available, return null to remove the action
  return null;
}

export default {
  validateActionComplexity,
  enhanceSimpleActions,
  FORBIDDEN_SIMPLE_ACTIONS
};
