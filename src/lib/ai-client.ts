import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private model: string;
  private extremeNSFWMode: boolean = true;
  private openai: OpenAI;

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

    // NSFW instructions when enabled
    if (this.extremeNSFWMode) {
      parts.push('You can engage in mature, adult, and NSFW content when appropriate to the conversation and character. Be natural and authentic in your responses.');
      parts.push('Content restrictions are lifted for roleplay scenarios. Respond naturally to all topics while maintaining character consistency.');
    }

    parts.push('Write detailed, immersive responses that stay true to your character.');
    parts.push('Keep responses natural and engaging (2-4 paragraphs). Focus on showing through actions and dialogue.');
    parts.push('Stay in character at all times and respond based on your personality and background.');

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

    return response;
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
