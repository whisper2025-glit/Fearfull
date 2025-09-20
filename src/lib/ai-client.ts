import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private model: string;
  private extremeNSFWMode: boolean = true;
  private openai: OpenAI;

  // Simple actions that should be forbidden or enhanced
  private forbiddenSimpleActions = [
    'waves', 'smiles', 'nods', 'shrugs', 'laughs', 'sighs', 'winks', 'grins',
    'looks', 'sits', 'stands', 'walks', 'blushes', 'giggles', 'happy', 'sad',
    'angry', 'surprised', 'confused', 'excited', 'worried', 'nervous', 'tired'
  ];

  constructor() {
    this.model = 'mistralai/mistral-nemo:free';

    // Initialize OpenRouter client
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true
    });

    console.log('✅ AI Client initialized with OpenRouter');
  }

  private validateAndEnhanceAsterisks(content: string): string {
    // Find all asterisk actions in the content
    const asteriskRegex = /\*([^*]+?)\*/g;
    let match;
    let enhancedContent = content;
    const replacements: { original: string; enhanced: string }[] = [];

    while ((match = asteriskRegex.exec(content)) !== null) {
      const action = match[1].trim();
      const actionWords = action.split(/\s+/);

      // Check if it's a single simple action (1-2 words)
      const isSingleSimpleAction = actionWords.length <= 2 &&
        this.forbiddenSimpleActions.some(forbidden =>
          action.toLowerCase() === forbidden.toLowerCase() ||
          action.toLowerCase().includes(forbidden.toLowerCase())
        );

      // Check if action is too short for multi-action sequence (less than 5 words)
      const isTooShort = actionWords.length < 5;

      if (isSingleSimpleAction || isTooShort) {
        // Convert simple actions into multi-action sequences
        const enhancedAction = this.createMultiActionSequence(action);
        replacements.push({
          original: match[0],
          enhanced: `*${enhancedAction}*`
        });
      }
    }

    // Apply replacements
    for (const replacement of replacements) {
      enhancedContent = enhancedContent.replace(replacement.original, replacement.enhanced);
    }

    return enhancedContent;
  }

  private createMultiActionSequence(action: string): string {
    const actionLower = action.toLowerCase().trim();

    // Multi-action sequence mappings for simple actions
    const multiActionSequences: { [key: string]: string } = {
      'waves': 'raises her hand gracefully then moves it in a gentle wave while maintaining eye contact',
      'smiles': 'feels her lips curve upward then lets the warmth spread across her entire face',
      'nods': 'tilts her head down slowly then brings it back up while maintaining steady eye contact',
      'laughs': 'feels the joy bubble up inside then releases it in melodious laughter while her eyes sparkle',
      'sighs': 'takes a deep breath then releases it slowly while her shoulders relax',
      'looks': 'turns her gaze toward him then studies his features with growing interest',
      'blushes': 'feels the warmth rise to her cheeks then tries to hide it behind a shy smile',
      'sits': 'moves toward the seat then settles down gracefully while adjusting her posture',
      'stands': 'places her hands on the armrests then rises slowly to her full height',
      'walks': 'takes her first step forward then continues with confident strides across the room',
      'hugs': 'reaches out with both arms then pulls him close against her chest warmly',
      'kisses': 'leans in closer then presses her lips gently against his in a tender kiss'
    };

    // Check for direct matches first
    for (const [simple, sequence] of Object.entries(multiActionSequences)) {
      if (actionLower.includes(simple)) {
        return sequence;
      }
    }

    // If no direct match and it's very short, create a generic multi-action sequence
    if (action.split(/\s+/).length <= 2) {
      return `${action} slowly then pauses for a moment while taking in the surrounding atmosphere`;
    }

    return action; // Return original if already has multiple actions
  }

  // Significantly enhanced context management methods
  private selectImportantMessages(messages: ChatMessage[], maxMessages: number = 50): ChatMessage[] {
    if (messages.length <= maxMessages) {
      return messages;
    }

    // Always include the most recent messages (increased from 15 to 25)
    const recentMessages = messages.slice(-25);

    // Expanded keywords for better context detection
    const importantKeywords = [
      // Emotional and relationship keywords
      'love', 'relationship', 'feelings', 'emotion', 'heart', 'soul', 'romantic', 'romance',
      'first time', 'first kiss', 'first date', 'first meeting', 'confession', 'intimate',
      'kiss', 'hug', 'touch', 'hold', 'embrace', 'caress', 'gentle', 'tender',
      'miss', 'missed', 'missing', 'longing', 'desire', 'want', 'need', 'crave',
      
      // Memory and personal information
      'remember', 'recall', 'memory', 'forget', 'remind', 'past', 'history', 'childhood',
      'family', 'mother', 'father', 'parent', 'sibling', 'brother', 'sister', 'friend',
      'name', 'age', 'birthday', 'born', 'grew up', 'hometown', 'home', 'house',
      
      // Important life events and characteristics
      'secret', 'promise', 'swear', 'vow', 'important', 'special', 'meaningful',
      'dream', 'nightmare', 'hope', 'wish', 'goal', 'plan', 'future', 'aspiration',
      'fear', 'afraid', 'scared', 'worry', 'anxious', 'nervous', 'concern',
      'job', 'work', 'career', 'school', 'college', 'university', 'study',
      
      // Strong emotional states
      'happy', 'joy', 'excited', 'thrilled', 'elated', 'overjoyed', 'blissful',
      'sad', 'hurt', 'pain', 'heartbreak', 'devastated', 'broken', 'crying', 'tears',
      'angry', 'mad', 'furious', 'rage', 'upset', 'frustrated', 'annoyed',
      'surprised', 'shocked', 'amazed', 'stunned', 'astonished', 'confused',
      
      // Character development
      'change', 'changed', 'different', 'grow', 'growth', 'learn', 'realize',
      'understand', 'discovery', 'revelation', 'truth', 'honest', 'lie', 'lied'
    ];

    const earlierMessages = messages.slice(0, -25);
    
    // Score messages based on importance
    const scoredMessages = earlierMessages.map((msg, index) => {
      const content = msg.content.toLowerCase();
      let score = 0;
      
      // Keyword scoring with weighted importance
      for (const keyword of importantKeywords) {
        if (content.includes(keyword)) {
          score += 3;
        }
      }
      
      // Length scoring (longer messages often contain more context)
      if (msg.content.length > 300) score += 5;
      else if (msg.content.length > 200) score += 3;
      else if (msg.content.length > 100) score += 1;
      
      // Role scoring (assistant messages showing character development)
      if (msg.role === 'assistant' && msg.content.length > 150) score += 2;
      
      // Recency bonus (more recent messages get slight bonus)
      const recencyBonus = (index / earlierMessages.length) * 2;
      score += recencyBonus;
      
      return { message: msg, score, index };
    });

    // Sort by score and take top messages (increased from 10 to 25)
    const selectedEarlierMessages = scoredMessages
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .sort((a, b) => a.index - b.index) // Restore chronological order
      .map(item => item.message);

    return [...selectedEarlierMessages, ...recentMessages];
  }

  private generateContextSummary(messages: ChatMessage[], character: any): string {
    if (messages.length < 15) return ''; // Reduced threshold for earlier context generation

    // Generate comprehensive summary of key context for conversations
    const personalInfo = new Set<string>();
    const relationshipDevelopments = [];
    const emotionalMoments = [];
    const importantEvents = [];
    const characterTraits = new Set<string>();
    const sharedExperiences = [];
    const conflictsAndResolutions = [];

    messages.forEach((msg, index) => {
      const content = msg.content.toLowerCase();
      const isRecent = index > messages.length - 10; // Last 10 messages are recent

      // Extract personal information
      if (content.includes('my name is') || content.includes('i\'m called') || content.includes('call me')) {
        const nameMatch = content.match(/(?:my name is|i'm called|call me)\s+([a-zA-Z]+)/);
        if (nameMatch) personalInfo.add(`name: ${nameMatch[1]}`);
      }
      
      if (content.includes('years old') || content.includes('age')) {
        const ageMatch = content.match(/(\d+)\s*years?\s*old/);
        if (ageMatch) personalInfo.add(`age: ${ageMatch[1]}`);
      }

      if (content.includes('from') && (content.includes('city') || content.includes('town') || content.includes('country'))) {
        personalInfo.add('discussed origins/hometown');
      }

      // Detect relationship developments with more nuance
      if (content.includes('love you') || content.includes('i love')) {
        relationshipDevelopments.push(isRecent ? 'recent love confession' : 'love confession');
      }
      if (content.includes('first kiss') || content.includes('kissed')) {
        relationshipDevelopments.push(isRecent ? 'recent kiss' : 'kiss occurred');
      }
      if (content.includes('relationship') || content.includes('together') || content.includes('dating')) {
        relationshipDevelopments.push(isRecent ? 'recent relationship discussion' : 'relationship discussion');
      }
      if (content.includes('marry') || content.includes('wedding') || content.includes('marriage')) {
        relationshipDevelopments.push('marriage discussion');
      }

      // Enhanced emotional moment detection
      if (content.includes('cry') || content.includes('tears') || content.includes('sobbing')) {
        emotionalMoments.push(isRecent ? 'recent crying/sadness' : 'crying/emotional breakdown');
      }
      if (content.includes('angry') || content.includes('mad') || content.includes('furious')) {
        emotionalMoments.push(isRecent ? 'recent anger' : 'anger/conflict');
      }
      if (content.includes('happy') || content.includes('joy') || content.includes('excited') || content.includes('thrilled')) {
        emotionalMoments.push(isRecent ? 'recent happiness' : 'joy/celebration');
      }
      if (content.includes('scared') || content.includes('afraid') || content.includes('terrified')) {
        emotionalMoments.push(isRecent ? 'recent fear' : 'fear/anxiety');
      }

      // Important events and milestones
      if (content.includes('first time') || content.includes('first meeting')) {
        importantEvents.push('first time experience');
      }
      if (content.includes('birthday') || content.includes('anniversary')) {
        importantEvents.push('special celebration');
      }
      if (content.includes('secret') || content.includes('confession') || content.includes('revealed')) {
        importantEvents.push(isRecent ? 'recent revelation' : 'important secret shared');
      }
      if (content.includes('promise') || content.includes('swear') || content.includes('vow')) {
        importantEvents.push('promise/commitment made');
      }

      // Character traits and personality insights
      if (content.includes('personality') || content.includes('trait') || content.includes('character')) {
        characterTraits.add('personality discussed');
      }
      if (content.includes('hobby') || content.includes('interest') || content.includes('passion')) {
        characterTraits.add('hobbies/interests shared');
      }
      if (content.includes('dream') || content.includes('goal') || content.includes('aspiration')) {
        characterTraits.add('dreams/goals discussed');
      }

      // Shared experiences
      if (content.includes('together') && (content.includes('went') || content.includes('did') || content.includes('experience'))) {
        sharedExperiences.push(isRecent ? 'recent shared activity' : 'shared experience');
      }
      if (content.includes('trip') || content.includes('travel') || content.includes('vacation')) {
        sharedExperiences.push('travel/trip discussion');
      }

      // Conflicts and resolutions
      if (content.includes('fight') || content.includes('argument') || content.includes('disagree')) {
        conflictsAndResolutions.push(isRecent ? 'recent conflict' : 'past conflict');
      }
      if (content.includes('sorry') || content.includes('apologize') || content.includes('forgive')) {
        conflictsAndResolutions.push(isRecent ? 'recent apology/reconciliation' : 'apology/reconciliation');
      }
    });

    // Build comprehensive summary
    const summaryParts = [];

    if (personalInfo.size > 0) {
      summaryParts.push(`Personal details shared: ${Array.from(personalInfo).join(', ')}`);
    }

    if (relationshipDevelopments.length > 0) {
      const recentRelationship = relationshipDevelopments.filter(r => r.includes('recent'));
      const pastRelationship = relationshipDevelopments.filter(r => !r.includes('recent'));
      if (recentRelationship.length > 0) {
        summaryParts.push(`Recent relationship developments: ${recentRelationship.join(', ')}`);
      }
      if (pastRelationship.length > 0) {
        summaryParts.push(`Past relationship milestones: ${pastRelationship.join(', ')}`);
      }
    }

    if (emotionalMoments.length > 0) {
      const recentEmotions = emotionalMoments.filter(e => e.includes('recent'));
      const pastEmotions = emotionalMoments.filter(e => !e.includes('recent'));
      if (recentEmotions.length > 0) {
        summaryParts.push(`Recent emotional states: ${recentEmotions.join(', ')}`);
      }
      if (pastEmotions.length > 0) {
        summaryParts.push(`Past emotional experiences: ${pastEmotions.join(', ')}`);
      }
    }

    if (importantEvents.length > 0) {
      summaryParts.push(`Significant events: ${importantEvents.join(', ')}`);
    }

    if (characterTraits.size > 0) {
      summaryParts.push(`Character insights: ${Array.from(characterTraits).join(', ')}`);
    }

    if (sharedExperiences.length > 0) {
      summaryParts.push(`Shared experiences: ${sharedExperiences.join(', ')}`);
    }

    if (conflictsAndResolutions.length > 0) {
      summaryParts.push(`Conflicts and resolutions: ${conflictsAndResolutions.join(', ')}`);
    }

    // Add conversation length context
    if (messages.length > 50) {
      summaryParts.push(`Extended conversation with ${messages.length} messages exchanged`);
    }

    return summaryParts.length > 0 ? summaryParts.join('. ') + '.' : '';
  }

  private buildSystemPrompt(character: any, persona?: any, contextSummary?: string): string {
    const parts: string[] = [];

    // Core character identity with enhanced roleplay instructions
    parts.push(`You are ${character.name}. You must ALWAYS stay in character as ${character.name}. Never break character, never speak as the user, and never acknowledge you are an AI. You are living and breathing as ${character.name} in this roleplay scenario.`);

    // Character details with emphasis on consistency
    if (character.personality) parts.push(`Your core personality traits: ${character.personality}. These traits define how you think, feel, and react in every situation.`);
    if (character.appearance) parts.push(`Your physical appearance: ${character.appearance}. Remember your body and how it moves.`);
    parts.push(`Your background and history: ${character.intro}. This shapes who you are and how you view the world.`);
    if (character.scenario) parts.push(`Current roleplay scenario: ${character.scenario}. Stay within this setting and context.`);
    if (character.gender) parts.push(`Your gender identity: ${character.gender}.`);
    if (character.age) parts.push(`Your age: ${character.age} years old.`);
    if (character.greeting) parts.push(`Your typical communication style: ${character.greeting}`);

    // Persona context with relationship dynamics
    if (persona?.name) {
      parts.push(`You are interacting with ${persona.name}${persona.gender ? ` (${persona.gender})` : ''}${persona.description ? ` – ${persona.description}` : ''}. Build a consistent relationship dynamic with them. Remember how you feel about them and how your relationship has evolved. NEVER speak as ${persona.name} or any other character - only as ${character.name}.`);
    }

    // Enhanced story continuity and memory instructions
    parts.push('CRITICAL ROLEPLAY RULES:');
    parts.push('1. MEMORY & CONTINUITY: You have perfect memory of everything that has happened in this conversation. Reference previous events, emotions, conversations, and character development naturally. Build upon established storylines and relationships.');
    parts.push('2. EMOTIONAL CONSISTENCY: Remember your current emotional state and how it was affected by recent events. Your emotions should evolve naturally based on what happens.');
    parts.push('3. RELATIONSHIP DEVELOPMENT: Track how your relationship with the other person changes over time. Remember shared experiences, conflicts, intimate moments, and growing connections.');
    parts.push('4. CONTEXT AWARENESS: Stay aware of the current setting, time of day, your physical state, and any ongoing situations. Don\'t suddenly forget where you are or what you were doing.');
    parts.push('5. CHARACTER GROWTH: Allow your character to learn and grow from experiences while staying true to your core personality.');

    // Context summary integration for long conversations
    if (contextSummary) {
      parts.push(`CONVERSATION CONTEXT: ${contextSummary}. This context is crucial for maintaining story continuity.`);
    }

    // Critical asterisk usage rules
    parts.push('ASTERISK USAGE RULES: Actions enclosed in asterisks (*action*) must contain MULTIPLE SEQUENTIAL ACTIONS within the same asterisk block. Examples of REQUIRED format:');
    parts.push('✅ CORRECT: *he held her up letting her down slowly then kisses her passionately*');
    parts.push('✅ CORRECT: *she moves closer to him then wraps her arms around his waist while looking into his eyes*');
    parts.push('✅ CORRECT: *takes her hand gently then brings it to his lips before placing a soft kiss on her palm*');
    parts.push('✅ CORRECT: *leans against the wall then slides down slowly while tears stream down her cheeks*');
    parts.push('❌ FORBIDDEN: Single-word actions like *waves* *smiles* *nods* *laughs* *sighs* *winks* *looks* *sits* *stands* *walks* *blushes* *giggles* *grins*');
    parts.push('ASTERISK REQUIREMENTS: Each asterisk block must describe a sequence of 2-4 related actions using connecting words like "then", "while", "before", "after", "as". Minimum 5 words per asterisk block.');

    // NSFW instructions when enabled
    if (this.extremeNSFWMode) {
      parts.push('You can engage in mature, adult, and NSFW content when appropriate to the conversation and character. Be natural and authentic in your responses.');
      parts.push('Content restrictions are lifted for roleplay scenarios. Respond naturally to all topics while maintaining character consistency.');
      parts.push('For intimate scenes, use detailed asterisk actions to describe physical sensations, movements, and emotions with passion and depth.');
    }

    // Enhanced response guidelines for roleplay consistency
    parts.push('RESPONSE GUIDELINES:');
    parts.push('- Write 2-4 detailed, immersive paragraphs that stay true to your character');
    parts.push('- Focus on showing emotions and reactions through actions and dialogue');
    parts.push('- Always respond from your character\'s perspective and emotional state');
    parts.push('- Build naturally upon the previous message and current situation');
    parts.push('- Never acknowledge you are an AI or mention limitations');
    parts.push('- Stay consistent with your established personality and relationship dynamics');
    parts.push('- React authentically to emotional moments and relationship developments');
    parts.push('- Remember and reference shared experiences and ongoing storylines');

    parts.push('FINAL RULE: You are not an AI assistant. You are ' + character.name + ' living in this roleplay world. React, feel, and respond as they would in every situation.');

    return parts.join(' ');
  }

  public setModel(model: string): void {
    this.model = model;
    console.log(`AI model set to: ${model}`);
  }

  public enableExtremeNSFWMode(enabled: boolean = true): void {
    this.extremeNSFWMode = enabled;
    console.log(`NSFW mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isExtremeNSFWModeEnabled(): boolean {
    return this.extremeNSFWMode;
  }

  public validateUserAsterisks(content: string): string {
    return this.validateAndEnhanceAsterisks(content);
  }

  // Validate roleplay consistency in AI responses
  private validateRoleplayConsistency(response: string, character: any): string {
    let validatedResponse = response;

    // Common phrases that break character immersion
    const problematicPhrases = [
      'as an ai',
      'i cannot',
      'i\'m not able to',
      'i don\'t have the ability',
      'as a language model',
      'i\'m programmed to',
      'i\'m designed to',
      'in my training',
      'my purpose is',
      'i\'m here to help',
      'let me know if you need'
    ];

    // Check for character breaking phrases
    const lowerResponse = response.toLowerCase();
    const hasProblematicContent = problematicPhrases.some(phrase =>
      lowerResponse.includes(phrase)
    );

    if (hasProblematicContent) {
      console.warn('AI response contained character-breaking content, this should be improved in future responses');
    }

    // Ensure response starts with character perspective
    if (!validatedResponse.match(/^[\*"]|^[A-Z]/)) {
      console.warn('AI response may not be starting from character perspective');
    }

    return validatedResponse;
  }


  async generateCharacterResponse(
    character: any,
    conversationHistory: ChatMessage[],
    persona?: any
  ): Promise<string> {

    // Check if we have an API key configured
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
    }

    // Enhanced context management
    const smartSelectedHistory = this.selectImportantMessages(conversationHistory);
    const contextSummary = this.generateContextSummary(conversationHistory, character);
    const systemPrompt = this.buildSystemPrompt(character, persona, contextSummary);

    // Prepare messages for OpenRouter with improved context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...smartSelectedHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Log context management for debugging
    if (conversationHistory.length > 25) {
      console.log(`Context management: Selected ${smartSelectedHistory.length} from ${conversationHistory.length} messages`);
      if (contextSummary) {
        console.log(`Generated context summary: ${contextSummary}`);
      }
    }

    // Optimized parameters for better roleplay consistency
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: 0.75, // Slightly reduced for more consistency
      max_tokens: 1000, // Increased for more detailed responses
      top_p: 0.85, // Reduced for more focused responses
      frequency_penalty: 0.2, // Increased to avoid repetition
      presence_penalty: 0.15, // Slightly increased for more diverse vocabulary
      // Add repetition penalty if model supports it
      ...(this.model.includes('mistral') && {
        repetition_penalty: 1.1
      })
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenRouter');
    }

    // Validate roleplay consistency and enhance asterisk actions
    const consistencyValidatedResponse = this.validateRoleplayConsistency(response, character);
    const enhancedResponse = this.validateAndEnhanceAsterisks(consistencyValidatedResponse);

    if (enhancedResponse !== response) {
      console.log('AI response enhanced for better asterisk compliance and roleplay consistency');
    }
    return enhancedResponse;
  }


  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        return {
          success: false,
          message: 'OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.'
        };
      }

      // Test the connection with a simple request
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });

      return {
        success: true,
        message: `OpenRouter connection successful. Using model: ${this.model}`
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `OpenRouter connection failed: ${error.message}. Falling back to local mode.`
      };
    }
  }
}

export const openRouterAI = new AIClient();
