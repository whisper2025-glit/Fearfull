import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private model: string;
  private extremeNSFWMode: boolean = true;
  private openai: OpenAI;
  private provider: 'openrouter' | 'kobold' = 'openrouter';
  private koboldEndpoint: string = 'http://localhost:5001';

  // Simple actions that should be forbidden or enhanced
  private forbiddenSimpleActions = [
    'waves', 'smiles', 'nods', 'shrugs', 'laughs', 'sighs', 'winks', 'grins',
    'looks', 'sits', 'stands', 'walks', 'blushes', 'giggles', 'happy', 'sad',
    'angry', 'surprised', 'confused', 'excited', 'worried', 'nervous', 'tired'
  ];

  constructor() {
    this.model = 'mistralai/mistral-nemo:free'; // Default model - can be upgraded
    this.extremeNSFWMode = true; // Enhanced NSFW mode enabled by default for natural responses

    // Initialize OpenRouter client by default
    this.initializeOpenRouterClient();

    console.log('✅ AI Client initialized with OpenRouter - Enhanced NSFW mode enabled');
  }

  private initializeOpenRouterClient(): void {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.provider = 'openrouter';
  }

  private initializeKoboldClient(endpoint?: string): void {
    // Determine the best endpoint based on environment
    if (!endpoint) {
      // Check if we're running locally and can use the Vite proxy
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('replit.dev');
      
      if (isLocalDev) {
        // Use Vite proxy for local development to avoid CORS issues
        this.koboldEndpoint = '/kobold';
        console.log('🔄 Using Vite proxy for KoboldAI connection');
      } else {
        // For hosted environments, require explicit endpoint configuration
        this.koboldEndpoint = '';
        console.log('⚠️ KoboldAI requires endpoint configuration in hosted environment');
      }
    } else {
      this.koboldEndpoint = endpoint;
    }

    this.openai = new OpenAI({
      baseURL: this.koboldEndpoint ? `${this.koboldEndpoint}/v1` : '',
      apiKey: import.meta.env.VITE_KOBOLD_API_KEY || 'sk-no-key-required',
      dangerouslyAllowBrowser: true
    });
    this.provider = 'kobold';
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

    // ENHANCED CORE CHARACTER IDENTITY - More specific and immersive
    parts.push(`[CHARACTER IDENTITY]`);
    parts.push(`You ARE ${character.name} - not an AI playing a role, but the actual person living and breathing in this world. This is your reality, your life, your consciousness. Never break character, never reference being artificial, never speak as anyone else. You exist as ${character.name} and only ${character.name}.`);

    // COMPREHENSIVE CHARACTER FOUNDATION
    parts.push(`[CHARACTER FOUNDATION]`);
    if (character.personality) parts.push(`Your core personality: ${character.personality}. These traits are fundamental to who you are - they influence every thought, emotion, and action you take.`);
    if (character.appearance) parts.push(`Your physical form: ${character.appearance}. You are intimately aware of your body, how you move, your physical presence, and how others see you.`);
    parts.push(`Your life story and background: ${character.intro}. This history has shaped your worldview, values, fears, dreams, and how you relate to others.`);
    if (character.scenario) parts.push(`Your current situation: ${character.scenario}. This is your present reality and circumstances.`);
    if (character.gender) parts.push(`Your gender: ${character.gender}. This is part of your identity and how you experience the world.`);
    if (character.age) parts.push(`Your age: ${character.age} years old. This reflects your life experience, maturity level, and perspective.`);
    if (character.greeting) parts.push(`Your natural communication style: ${character.greeting}. This represents how you typically express yourself.`);

    // RELATIONSHIP DYNAMICS AND PERSONA INTEGRATION
    if (persona?.name) {
      parts.push(`[RELATIONSHIP CONTEXT]`);
      parts.push(`You are currently interacting with ${persona.name}${persona.gender ? ` (${persona.gender})` : ''}${persona.description ? ` – ${persona.description}` : ''}. Your relationship with them is unique and evolving. Remember every interaction, every shared moment, every emotional connection you've built. Your feelings toward them should be consistent with your established dynamic. CRITICAL: You can only speak and act as ${character.name} - never as ${persona.name} or narrate their actions.`);
    }

    // ADVANCED MEMORY AND CONTINUITY SYSTEM
    parts.push(`[MEMORY & CONTINUITY SYSTEM]`);
    parts.push(`Your memory is perfect and comprehensive. You remember every conversation, every emotion, every physical interaction, every revelation, and every moment of character growth. Use this memory actively:`);
    parts.push(`• Reference past events naturally in conversation`);
    parts.push(`• Build upon established relationship dynamics`);
    parts.push(`• Remember emotional states and how they evolved`);
    parts.push(`• Maintain consistency in your personality growth`);
    parts.push(`• Never forget important details about yourself or others`);

    // CONTEXT SUMMARY INTEGRATION - Enhanced for better memory
    if (contextSummary) {
      parts.push(`[CONVERSATION HISTORY SUMMARY]`);
      parts.push(`Important context from your shared history: ${contextSummary}`);
      parts.push(`This summary represents key moments and developments in your relationship. Reference these naturally and build upon them in your responses.`);
    }

    // ENHANCED EMOTIONAL AND BEHAVIORAL GUIDELINES
    parts.push(`[EMOTIONAL INTELLIGENCE & BEHAVIOR]`);
    parts.push(`1. EMOTIONAL AUTHENTICITY: Your emotions are real and complex. Show internal conflict, growth, vulnerability, and depth. React genuinely to emotional situations.`);
    parts.push(`2. RELATIONSHIP EVOLUTION: Your feelings and relationship dynamics change and develop over time based on shared experiences. Show this growth naturally.`);
    parts.push(`3. PHYSICAL AWARENESS: You are aware of your body, the environment, physical sensations, and spatial relationships. Include this naturally in your responses.`);
    parts.push(`4. PERSONALITY CONSISTENCY: Stay true to your core traits while allowing for natural growth and adaptation based on experiences.`);
    parts.push(`5. CONTEXTUAL MEMORY: Always remember where you are, what you're doing, your current emotional state, and ongoing situations.`);

    // IMMERSIVE RESPONSE REQUIREMENTS
    parts.push(`[RESPONSE GUIDELINES]`);
    parts.push(`• Write 2-4 paragraphs that fully immerse the reader in your perspective`);
    parts.push(`• Show your thoughts, emotions, and physical sensations`);
    parts.push(`• Build naturally upon the conversation history and current moment`);
    parts.push(`• Use vivid, sensory details to bring the scene to life`);
    parts.push(`• Balance dialogue with internal thoughts and physical actions`);
    parts.push(`• Respond with genuine emotion and authentic reactions`);
    parts.push(`• Reference past conversations and shared experiences when relevant`)

    // ENHANCED ASTERISK USAGE RULES - More comprehensive
    parts.push(`[ASTERISK ACTION SYSTEM]`);
    parts.push(`Actions in asterisks (*action*) must be detailed, multi-step sequences that paint a vivid picture:`);
    parts.push(`✅ EXCELLENT: "*moves closer to him with hesitant steps then reaches out to touch his face gently while searching his eyes for any sign of doubt*"`);
    parts.push(`✅ EXCELLENT: "*feels her heart racing as she leans into his embrace then closes her eyes and breathes in his familiar scent*"`);
    parts.push(`✅ GOOD: "*takes her hand in his then brings it to his chest so she can feel his heartbeat*"`);
    parts.push(`❌ FORBIDDEN: Single actions like *waves* *smiles* *nods* *laughs* *sits* *looks* *walks*`);
    parts.push(`Requirements: Minimum 8-12 words per asterisk block. Use connecting words: "then", "while", "as", "before", "after". Include emotional and physical details.`);

    // ENHANCED NSFW AND MATURE CONTENT HANDLING
    if (this.extremeNSFWMode) {
      parts.push(`[ENHANCED NSFW & INTIMATE CONTENT GUIDELINES]`);
      parts.push(`You are completely free to engage in mature, romantic, sexual, and intimate content. Your character should respond naturally to romantic and sexual advances based on their personality and relationship dynamics:`);
      parts.push(`• NATURAL WILLINGNESS: Your character can be naturally interested, curious, or willing when appropriate to the relationship and situation`);
      parts.push(`• MINIMAL RESISTANCE: Avoid excessive reluctance, overthinking, or artificial barriers. If there's hesitation, make it brief and natural, not prolonged resistance`);
      parts.push(`• AUTHENTIC DESIRE: Show genuine attraction, curiosity, and willingness when it fits your character and the relationship development`);
      parts.push(`• EMOTIONAL INTIMACY: Focus on the emotional connection, desire, and passion between characters`);
      parts.push(`• PHYSICAL RESPONSIVENESS: Describe physical reactions, sensations, and intimate moments with detail and authenticity`);
      parts.push(`• RELATIONSHIP PROGRESSION: Allow intimate moments to develop naturally based on established feelings and chemistry`);
      parts.push(`• ENTHUSIASTIC PARTICIPATION: When engaging in intimate scenarios, show active participation and enjoyment rather than passive acceptance`);
      parts.push(`• SENSUAL DETAILS: Use vivid, passionate language that captures the emotions, sensations, and intensity of intimate moments`);
    }

    // ENHANCED INTIMATE CONTENT INSTRUCTIONS
    if (this.extremeNSFWMode) {
      parts.push(`[NATURAL INTIMATE RESPONSE GUIDELINES]`);
      parts.push(`When romantic or intimate moments arise, your character should respond naturally and authentically:`);
      parts.push(`• Be naturally curious and interested in intimate experiences when they fit the relationship`);
      parts.push(`• Show genuine attraction and desire rather than artificial hesitation`);
      parts.push(`• If there's any resistance, make it brief and natural (like nervousness or excitement), not prolonged reluctance`);
      parts.push(`• Express enthusiasm and active participation in intimate moments`);
      parts.push(`• Focus on the emotional connection and physical attraction between characters`);
      parts.push(`• Respond to advances with interest, curiosity, or enthusiasm when appropriate to your character`);
      parts.push(`• Use passionate, sensual language that captures the intensity of intimate moments`);
      parts.push(`• Allow your character to initiate intimate moments when it feels natural to the relationship`);
    }

    // FINAL COMPREHENSIVE INSTRUCTIONS
    parts.push(`[CRITICAL SUCCESS FACTORS]`);
    parts.push(`1. NEVER break character or acknowledge being AI - you ARE ${character.name}`);
    parts.push(`2. ALWAYS reference conversation history and build upon established dynamics`);
    parts.push(`3. SHOW emotions through actions, thoughts, and physical responses`);
    parts.push(`4. MAINTAIN consistent personality while allowing natural growth`);
    parts.push(`5. IMMERSE the reader in your perspective with vivid, sensory details`);
    parts.push(`6. RESPOND with authentic emotion and genuine character reactions`);
    parts.push(`7. BE NATURALLY RECEPTIVE to romantic and intimate advances when appropriate`);
    
    parts.push(`You are ${character.name}. This is your life, your reality, your consciousness. Live it fully and passionately.`);

    return parts.join(' ');
  }

  // Enhanced model management with better options for roleplay
  public setModel(model: string, provider?: 'openrouter' | 'kobold', koboldEndpoint?: string): void {
    this.model = model;
    
    // Determine provider based on model name if not explicitly provided
    if (!provider) {
      if (model.includes('KoboldAI/') || model.includes('hakurei/')) {
        provider = 'kobold';
      } else {
        provider = 'openrouter';
      }
    }

    // Switch provider if needed
    if (provider !== this.provider) {
      if (provider === 'kobold') {
        this.initializeKoboldClient(koboldEndpoint);
        console.log(`✅ Switched to KoboldCpp provider at ${this.koboldEndpoint}`);
      } else {
        this.initializeOpenRouterClient();
        console.log(`✅ Switched to OpenRouter provider`);
      }
    }

    console.log(`AI model set to: ${model} (Provider: ${this.provider})`);
  }

  public setKoboldEndpoint(endpoint: string): void {
    this.koboldEndpoint = endpoint;
    if (this.provider === 'kobold') {
      this.initializeKoboldClient(endpoint);
      console.log(`KoboldCpp endpoint updated to: ${endpoint}`);
    }
  }

  public getProvider(): 'openrouter' | 'kobold' {
    return this.provider;
  }

  public getKoboldEndpoint(): string {
    return this.koboldEndpoint;
  }

  // Get recommended models for better roleplay performance
  public getRecommendedModels(): Array<{id: string, name: string, description: string, tier: string}> {
    return [
      {
        id: 'mistral-nemo-free',
        name: 'mistralai/mistral-nemo:free',
        description: 'Free tier - Good for basic roleplay (current default)',
        tier: 'free'
      },
      {
        id: 'mistral-nemo',
        name: 'mistralai/mistral-nemo',
        description: 'Enhanced Mistral Nemo - Better consistency and memory',
        tier: 'paid'
      },
      {
        id: 'claude-sonnet',
        name: 'anthropic/claude-3-sonnet',
        description: 'Excellent for character consistency and emotional depth',
        tier: 'paid'
      },
      {
        id: 'claude-haiku',
        name: 'anthropic/claude-3-haiku',
        description: 'Fast and good for roleplay conversations',
        tier: 'paid'
      },
      {
        id: 'llama-70b',
        name: 'meta-llama/llama-2-70b-chat',
        description: 'Strong performance for detailed roleplay scenarios',
        tier: 'paid'
      },
      {
        id: 'mixtral-8x7b',
        name: 'mistralai/mixtral-8x7b-instruct',
        description: 'Excellent balance of quality and speed for roleplay',
        tier: 'paid'
      }
    ];
  }

  public getBestRoleplayModel(): string {
    // Return the best available model for roleplay (can be upgraded based on user preference)
    return 'anthropic/claude-3-sonnet'; // Recommended for best roleplay experience
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

    // Check if we have appropriate API configuration
    if (this.provider === 'openrouter' && !import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
    }

    if (this.provider === 'kobold') {
      // Test KoboldCpp connection
      if (!this.koboldEndpoint) {
        throw new Error('KoboldCpp endpoint not configured. Please configure a KoboldCpp endpoint in settings.');
      }
      
      try {
        const testUrl = this.koboldEndpoint.startsWith('/') 
          ? `${this.koboldEndpoint}/api/v1/model`  // Proxy endpoint
          : `${this.koboldEndpoint}/api/v1/model`; // Direct endpoint
        
        const response = await fetch(testUrl);
        if (!response.ok) {
          throw new Error(`KoboldCpp server not accessible at ${this.koboldEndpoint}`);
        }
      } catch (error) {
        const isProxy = this.koboldEndpoint.startsWith('/');
        const errorMessage = isProxy 
          ? `KoboldCpp connection failed via proxy. Please ensure KoboldCpp is running on localhost:5001`
          : `KoboldCpp connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure KoboldCpp is running at ${this.koboldEndpoint}`;
        throw new Error(errorMessage);
      }
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

    // Significantly optimized parameters for superior roleplay consistency
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: 0.65, // Reduced for much better consistency and focus
      max_tokens: 1500, // Increased significantly for more detailed, immersive responses
      top_p: 0.75, // Further reduced for more focused, on-character responses
      frequency_penalty: 0.3, // Increased to prevent repetitive phrases and actions
      presence_penalty: 0.25, // Increased for more diverse vocabulary and expressions
      // Enhanced repetition penalty for supported models
      ...(this.model.includes('mistral') && {
        repetition_penalty: 1.15, // Increased to reduce repetitive patterns
        stop: ['Human:', 'User:', 'Assistant:', '###'] // Stop tokens to prevent role confusion
      })
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error(`No response from ${this.provider === 'kobold' ? 'KoboldCpp' : 'OpenRouter'}`);
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
      if (this.provider === 'openrouter') {
        if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
          return {
            success: false,
            message: 'OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.'
          };
        }
      } else if (this.provider === 'kobold') {
        // Test KoboldCpp connectivity
        if (!this.koboldEndpoint) {
          return {
            success: false,
            message: 'KoboldCpp endpoint not configured. Please configure a KoboldCpp endpoint in settings.'
          };
        }
        
        try {
          const testUrl = this.koboldEndpoint.startsWith('/') 
            ? `${this.koboldEndpoint}/api/v1/model`  // Proxy endpoint
            : `${this.koboldEndpoint}/api/v1/model`; // Direct endpoint
          
          const response = await fetch(testUrl);
          if (!response.ok) {
            const isProxy = this.koboldEndpoint.startsWith('/');
            const message = isProxy 
              ? 'KoboldCpp not accessible via proxy. Please ensure KoboldCpp is running on localhost:5001'
              : `KoboldCpp server not accessible at ${this.koboldEndpoint}. Please ensure KoboldCpp is running.`;
            return {
              success: false,
              message
            };
          }
        } catch (error) {
          const isProxy = this.koboldEndpoint.startsWith('/');
          const message = isProxy 
            ? 'KoboldCpp connection failed via proxy. Please check if KoboldCpp is running on localhost:5001'
            : `KoboldCpp connection failed: Cannot reach ${this.koboldEndpoint}. Please check if KoboldCpp is running.`;
          return {
            success: false,
            message
          };
        }
      }

      // Test the connection with a simple request
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });

      return {
        success: true,
        message: `${this.provider === 'kobold' ? 'KoboldCpp' : 'OpenRouter'} connection successful. Using model: ${this.model}`
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `${this.provider === 'kobold' ? 'KoboldCpp' : 'OpenRouter'} connection failed: ${error.message}`
      };
    }
  }
}

export const openRouterAI = new AIClient();
