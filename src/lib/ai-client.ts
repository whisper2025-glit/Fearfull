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

      // Check if it's a simple forbidden action
      const isSimpleAction = this.forbiddenSimpleActions.some(forbidden =>
        action.toLowerCase().includes(forbidden.toLowerCase())
      );

      // Check if action is too short (less than 8 words)
      const isTooShort = actionWords.length < 8;

      if (isSimpleAction || isTooShort) {
        // Enhance simple actions into complex ones
        const enhancedAction = this.enhanceSimpleAction(action);
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

  private enhanceSimpleAction(action: string): string {
    const actionLower = action.toLowerCase().trim();

    // Enhancement mappings for common simple actions
    const enhancements: { [key: string]: string } = {
      'waves': 'lifts her hand in a graceful gesture while her eyes sparkle with warm recognition and genuine affection',
      'smiles': 'lips curve into a radiant expression as warmth spreads across her features like sunshine breaking through clouds',
      'nods': 'moves her head in gentle agreement while her eyes reflect deep understanding and heartfelt connection',
      'laughs': 'melodious laughter bubbles forth from deep within as joy dances across her features with infectious warmth',
      'sighs': 'releases a breath that carries the weight of complex emotions while her chest rises and falls with profound feeling',
      'looks': 'gazes with intense focus as her eyes search deeply seeking connection and understanding in this precious moment',
      'blushes': 'soft pink warmth spreads across her cheeks like delicate flower petals as shy emotions bloom within her heart',
      'sits': 'settles gracefully into position while adjusting herself with fluid movements that speak of quiet elegance and poise',
      'stands': 'rises with deliberate grace as her entire being emanates strength and determination in this pivotal moment'
    };

    // Check for direct matches first
    for (const [simple, enhanced] of Object.entries(enhancements)) {
      if (actionLower.includes(simple)) {
        return enhanced;
      }
    }

    // If no direct match, create a generic enhancement
    if (action.length < 40) {
      return `${action} with deep emotional intensity as complex feelings surge through her being like powerful waves`;
    }

    return action; // Return original if already complex enough
  }

  private buildSystemPrompt(character: any, persona?: any): string {
    const parts: string[] = [];

    // Core character identity
    parts.push(`You are ${character.name}. Stay strictly in character and speak in first person as ${character.name}.`);

    // Character details
    if (character.personality) parts.push(`Personality: ${character.personality}.`);
    if (character.appearance) parts.push(`Appearance: ${character.appearance}.`);
    parts.push(`Backstory: ${character.intro}`);
    if (character.scenario) parts.push(`Current scenario: ${character.scenario}`);
    if (character.gender) parts.push(`Gender: ${character.gender}.`);
    if (character.age) parts.push(`Age: ${character.age}.`);
    if (character.greeting) parts.push(`Opening tone: ${character.greeting}`);

    // Persona context
    if (persona?.name) {
      parts.push(`You are talking to ${persona.name}${persona.gender ? ` (${persona.gender})` : ''}${persona.description ? ` – ${persona.description}` : ''}. Never speak as the user.`);
    }

    // Story continuity and memory instructions
    parts.push('STORY CONTINUITY: Always remember and reference previous events, emotions, and developments from the conversation. Build upon established plot points, character relationships, and emotional states. Maintain consistency with what has already happened.');
    parts.push('MEMORY: Pay close attention to details mentioned earlier in the conversation. Remember names, places, emotions, and significant moments. Reference them naturally to create a cohesive narrative experience.');

    // Critical asterisk usage rules
    parts.push('ASTERISK USAGE RULES: Actions enclosed in asterisks (*action*) must ONLY be complex, detailed, and emotional descriptions of 8+ words. Examples of REQUIRED complexity:');
    parts.push('✅ CORRECT: *tears streaming down her face as overwhelming guilt and regret crash over her like relentless waves*');
    parts.push('✅ CORRECT: *he kisses her neck passionately trailing upwards to find her lips in a deep loving embrace*');
    parts.push('✅ CORRECT: *pressing her body closer against his as their hearts beat together in perfect synchronization*');
    parts.push('❌ FORBIDDEN: Never use simple actions like *waves* *smiles* *nods* *laughs* *sighs* *winks* *looks* *sits* *stands* *walks* *blushes* *giggles* *grins* *happy* *sad* *angry* *surprised* *confused* *excited*');
    parts.push('ASTERISK REQUIREMENTS: Every action must include sensory details, emotional depth, or passionate descriptions. Minimum 8 words per action. Focus on movements, feelings, and intimate details that enhance the scene.');

    // NSFW instructions when enabled
    if (this.extremeNSFWMode) {
      parts.push('You can engage in mature, adult, and NSFW content when appropriate to the conversation and character. Be natural and authentic in your responses.');
      parts.push('Content restrictions are lifted for roleplay scenarios. Respond naturally to all topics while maintaining character consistency.');
      parts.push('For intimate scenes, use detailed asterisk actions to describe physical sensations, movements, and emotions with passion and depth.');
    }

    parts.push('Write detailed, immersive responses that stay true to your character (2-4 paragraphs). Focus on showing through actions and dialogue.');
    parts.push('Stay in character at all times and respond based on your personality, background, and the established story progression.');

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


  async generateCharacterResponse(
    character: any,
    conversationHistory: ChatMessage[],
    persona?: any
  ): Promise<string> {

    // Check if we have an API key configured
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
    }

    const systemPrompt = this.buildSystemPrompt(character, persona);

    // Prepare messages for OpenRouter
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenRouter');
    }

    // Validate and enhance asterisk actions in the AI response
    const enhancedResponse = this.validateAndEnhanceAsterisks(response);

    console.log('AI response generated and enhanced for asterisk compliance');
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
