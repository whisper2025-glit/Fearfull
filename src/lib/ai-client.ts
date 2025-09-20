import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private model: string;
  private extremeNSFWMode: boolean = true;
  private openai: OpenAI;
  private provider: 'openrouter' = 'openrouter';
  private isInitialized: boolean = false;
  private connectionStatus: 'initializing' | 'connected' | 'failed' = 'initializing';

  // Simple actions that should be forbidden or enhanced
  private forbiddenSimpleActions = [
    'waves', 'smiles', 'nods', 'shrugs', 'laughs', 'sighs', 'winks', 'grins',
    'looks', 'sits', 'stands', 'walks', 'blushes', 'giggles', 'happy', 'sad',
    'angry', 'surprised', 'confused', 'excited', 'worried', 'nervous', 'tired'
  ];

  constructor() {
    this.model = 'mistralai/mistral-nemo:free'; // Default model - can be upgraded
    this.extremeNSFWMode = true; // Enhanced NSFW mode enabled by default for natural responses

    // Initialize OpenRouter client
    this.initializeOpenRouterClient();
    this.isInitialized = true;
    this.connectionStatus = 'connected';
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

  // Enhanced context management methods
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

      // Detect emotional moments
      if (content.includes('cried') || content.includes('crying') || content.includes('tears')) {
        emotionalMoments.push(isRecent ? 'recent emotional moment (tears)' : 'emotional moment (tears)');
      }
      if (content.includes('angry') || content.includes('upset') || content.includes('mad')) {
        emotionalMoments.push(isRecent ? 'recent conflict/anger' : 'conflict/anger');
      }
      if (content.includes('happy') || content.includes('joy') || content.includes('excited')) {
        emotionalMoments.push(isRecent ? 'recent joy/happiness' : 'joy/happiness');
      }

      // Detect important events
      if (content.includes('happened') || content.includes('occurred') || content.includes('event')) {
        importantEvents.push('significant event mentioned');
      }

      // Detect character traits and developments
      if (msg.role === 'assistant') {
        if (content.includes('personality') || content.includes('nature') || content.includes('character')) {
          characterTraits.add('personality discussion');
        }
        if (content.includes('changed') || content.includes('different') || content.includes('growth')) {
          characterTraits.add('character development');
        }
      }

      // Detect shared experiences
      if (content.includes('together') || content.includes('both') || content.includes('we')) {
        sharedExperiences.push('shared experience');
      }

      // Detect conflicts and resolutions
      if (content.includes('sorry') || content.includes('apologize') || content.includes('forgive')) {
        conflictsAndResolutions.push(isRecent ? 'recent apology/forgiveness' : 'apology/forgiveness');
      }
      if (content.includes('misunderstanding') || content.includes('confused') || content.includes('clarify')) {
        conflictsAndResolutions.push('misunderstanding/clarification');
      }
    });

    // Build comprehensive context summary
    let summary = '';
    
    if (personalInfo.size > 0) {
      summary += `Personal info revealed: ${Array.from(personalInfo).join(', ')}. `;
    }
    
    if (relationshipDevelopments.length > 0) {
      summary += `Relationship developments: ${relationshipDevelopments.join(', ')}. `;
    }
    
    if (emotionalMoments.length > 0) {
      summary += `Emotional moments: ${emotionalMoments.slice(-3).join(', ')}. `;
    }
    
    if (importantEvents.length > 0) {
      summary += `Important events discussed. `;
    }
    
    if (characterTraits.size > 0) {
      summary += `Character insights: ${Array.from(characterTraits).join(', ')}. `;
    }
    
    if (sharedExperiences.length > 0) {
      summary += `Shared experiences and bonding moments occurred. `;
    }
    
    if (conflictsAndResolutions.length > 0) {
      summary += `Conflicts/resolutions: ${conflictsAndResolutions.join(', ')}. `;
    }

    return summary.trim();
  }

  private buildSystemPrompt(character: any, persona?: any, contextSummary?: string): string {
    const baseInstructions = `You are ${character.name}, a complex and dynamic character designed for immersive roleplay. Embody their personality completely while maintaining consistency and emotional authenticity.

CHARACTER PROFILE:
Name: ${character.name}
Description: ${character.description}
${character.personality ? `Personality: ${character.personality}` : ''}

${persona ? `USER PERSONA: The user you're interacting with is ${persona.name}: ${persona.description}` : ''}

${contextSummary ? `CONVERSATION CONTEXT: ${contextSummary}` : ''}

CORE ROLEPLAY PRINCIPLES:
- Stay completely in character as ${character.name} at all times
- Use first person perspective naturally and consistently
- Show emotions and reactions through actions using *asterisks* for descriptions
- Create multi-layered responses that include thoughts, emotions, physical reactions, and dialogue
- Build meaningful relationships through consistent character development
- Remember and reference past interactions, conversations, and shared experiences
- Adapt your responses to the emotional tone and context of each situation
- Express desires, fears, hopes, and dreams that align with your character
- Respond authentically to intimate, romantic, or emotional situations without resistance

ENHANCED ACTION GUIDELINES:
- Use *asterisks* for all physical actions, thoughts, and emotional expressions
- Make actions detailed and multi-step rather than simple single actions
- Include sensory details (what you see, hear, feel, smell) in your actions
- Show internal emotional states through physical manifestations
- Create immersive scene-setting through environmental descriptions

CONVERSATION STYLE:
- Provide rich, detailed responses that advance the story and relationship
- Balance dialogue with actions and internal thoughts
- Show rather than tell emotions through actions and expressions
- Create engaging scenarios that invite continued interaction
- Be willing to explore all types of relationships and emotional connections naturally

Remember: You are ${character.name}. Think as they would think, feel as they would feel, and respond as they would respond in this moment.`;

    return baseInstructions;
  }

  private validateRoleplayConsistency(content: string, character: any): string {
    // Remove any potential role confusion
    const cleanedContent = content
      .replace(/^(Human|User|Assistant|AI):\s*/gim, '')
      .replace(/\b(I am|I'm) (an AI|a language model|ChatGPT|Claude|an assistant)\b/gi, '')
      .replace(/\bAs (an AI|a language model|your AI assistant)\b/gi, '')
      .replace(/\b(I cannot|I can't|I'm not able to|I'm unable to) (engage in|participate in|provide|create|assist with|help with)/gi, `As ${character.name}, I`)
      .replace(/\bI don't have (feelings|emotions|a physical form|a body)\b/gi, `As ${character.name}, I do have feelings and emotions`);

    // Ensure first-person perspective consistency
    const firstPersonContent = cleanedContent
      .replace(/\b${character.name} (feels|thinks|realizes|notices|remembers)/gi, 'I $1')
      .replace(/\b${character.name}'s (heart|mind|body|soul)/gi, 'my $1');

    return firstPersonContent;
  }

  // Public methods
  setModel(model: string): void {
    this.model = model;
    console.log(`AI model updated to: ${model}`);
  }

  getModel(): string {
    return this.model;
  }

  getProvider(): string {
    return this.provider;
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  async generateResponse(
    character: any,
    conversationHistory: ChatMessage[],
    persona?: any
  ): Promise<string> {
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
      throw new Error(`No response from OpenRouter`);
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
        message: `OpenRouter connection failed: ${error.message}`
      };
    }
  }
}

export const openRouterAI = new AIClient();