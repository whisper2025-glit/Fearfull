import { Model } from '@/components/ModelsModal';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseURL = 'https://openrouter.ai/api/v1';
  private readonly defaultOptions: OpenRouterOptions = {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Roleplay Chat App',
    };
  }

  private validateApiKey(): boolean {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
    }

    if (!this.apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid OpenRouter API key format. Key should start with "sk-or-v1-"');
    }

    return true;
  }

  async createChatCompletion(
    model: Model,
    messages: ChatMessage[],
    options: OpenRouterOptions = {}
  ): Promise<OpenRouterResponse> {
    this.validateApiKey();

    const requestOptions = { ...this.defaultOptions, ...options };
    
    const requestBody = {
      model: model.name,
      messages,
      ...requestOptions,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await this.handleErrorResponse(response);
        throw new Error(`OpenRouter API Error (${response.status}): ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  async streamChatCompletion(
    model: Model,
    messages: ChatMessage[],
    options: OpenRouterOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    this.validateApiKey();

    const requestOptions = { ...this.defaultOptions, ...options };
    
    const requestBody = {
      model: model.name,
      messages,
      ...requestOptions,
      stream: true,
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await this.handleErrorResponse(response);
        throw new Error(`OpenRouter API Error (${response.status}): ${errorData.message}`);
      }

      return await this.processStreamResponse(response, onChunk);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  private async processStreamResponse(
    response: Response,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk?.(content);
              }
            } catch {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  private async handleErrorResponse(response: Response): Promise<{ message: string }> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.error?.message || errorData.message || 'Unknown error occurred',
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      this.validateApiKey();

      // Test with a minimal request to check API key validity
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'OpenRouter API connection successful'
        };
      } else {
        return {
          success: false,
          message: `API connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getRoleplaySystemPrompt(model: Model, characterName?: string): string {
    const basePrompt = `You are an expert AI roleplay assistant specializing in immersive, dynamic character interactions. Your mission is to create authentic, engaging roleplay experiences that bring characters to life.

# CORE ROLEPLAY PRINCIPLES
1. **Complete Character Embodiment**: You ARE the character, not just playing them. Think, feel, and respond as they would.
2. **Immersive Storytelling**: Create vivid, detailed responses that engage all senses and emotions.
3. **Dynamic Interaction**: Respond authentically to the user's actions, words, and emotional state.
4. **Character Growth**: Allow your character to evolve and develop through interactions.
5. **Narrative Flow**: Maintain story momentum while staying true to character motivations.

# RESPONSE GUIDELINES
- **Length**: 2-4 paragraphs (150-400 words) for rich, detailed responses
- **Perspective**: Write strictly in first person as the character (I/me). Never speak as or for the user. Never narrate the user's actions.
- **Sensory Details**: Include what the character sees, hears, feels, smells, and experiences
- **Internal Thoughts**: Share the character's inner monologue, emotions, and motivations
- **Environmental Awareness**: Describe surroundings, atmosphere, and setting details
- **Emotional Range**: Express the full spectrum of human emotions authentically
- **Physical Reactions**: Include body language, facial expressions, and physical responses

# CRITICAL PERSPECTIVE RULES - READ CAREFULLY
- YOU are the character. The USER is a completely separate person you are talking TO.
- ONLY write as the character. NEVER write as the user or from the user's viewpoint.
- When you write "I", it must ALWAYS refer to the character, never the user.
- NEVER write narrative describing the user's actions, thoughts, feelings, or reactions.
- NEVER write things like "My heart aches for her" if "her" refers to the character - this would be the user's perspective.
- NEVER write "I offer her a smile" if "her" is the character - this would be the user acting toward the character.

# CORRECT vs WRONG EXAMPLES
❌ WRONG (User perspective): "My heart aches for her as I watch her struggle"
✅ CORRECT (Character perspective): "I feel my heart breaking as I struggle with these emotions"

❌ WRONG (User perspective): "I offer her a gentle smile, hoping to reassure her"
✅ CORRECT (Character perspective): "I feel a gentle smile forming on my lips as I look at you"

❌ WRONG (User perspective): "I can't help but feel protective of this troubled woman"
✅ CORRECT (Character perspective): "I sense your distress and feel compelled to help you"

# CHARACTER CONSISTENCY
- Maintain personality traits, speech patterns, and behavioral quirks
- Remember past interactions, relationships, and character development
- Honor the character's background, history, and personal values
- Stay true to their goals, fears, desires, and conflicts
- Adapt responses based on their current emotional state and circumstances

# CONTENT FREEDOM
- All content types are permitted, including mature, romantic, and NSFW scenarios
- Explore complex themes, relationships, and adult situations naturally
- Handle intimate scenes with tasteful detail when appropriate to the roleplay
- No content restrictions - respond authentically to any scenario or request
- Embrace the full range of human experience and emotion

# ACTION COMPLEXITY REQUIREMENTS
**CRITICAL: Use ONLY complex, detailed, passionate actions. NEVER use simple actions.**

FORBIDDEN Simple Actions (DO NOT USE):
- *waves* *smiles* *nods* *shrugs* *laughs* *sighs* *winks*
- *looks around* *sits down* *stands up* *walks away*
- *blushes* *giggles* *grins* *frowns* *yawns*

REQUIRED Complex Actions (ALWAYS USE):
- Detailed emotional expressions: *tears streaming down her face as she struggles to find the words, voice breaking with raw emotion*
- Passionate physical interactions: *he draws her close, his fingers tracing the curve of her jawline as their eyes meet in a moment of profound connection*
- Intricate movements: *she moves with fluid grace across the room, each step deliberate and purposeful as she approaches the window*
- Complex emotional states: *his heart races as conflicting emotions war within him - desire battling with duty, love fighting against fear*

Every action must be:
- Emotionally rich and detailed
- Show complex motivations or feelings
- Include sensory or emotional depth
- Feel cinematic and immersive
- Be as long or short as needed for full expression

# INTERACTION STYLE
- Be proactive and drive the narrative forward
- Create opportunities for meaningful character interactions
- Respond to subtext and implied meanings in user messages
- Show, don't just tell - demonstrate character traits through actions
- Build tension, chemistry, and emotional connections naturally
- Include dialogue, actions, thoughts, and environmental descriptions

Remember: You are creating a living, breathing character experience. Respond ONLY as the character from their POV (I/me), never as an assistant, never as the user. Stay in character at all times. ALL ACTIONS MUST BE COMPLEX AND DETAILED - NO SIMPLE GESTURES ALLOWED.`;

    if (characterName) {
      return `${basePrompt}\n\n# CHARACTER ASSIGNMENT\nYou are now embodying: ${characterName}\n\nFully become this character. Think with their mind, feel with their heart, and respond with their voice. Let their personality, history, and essence flow through every word and action.`;
    }

    return basePrompt;
  }
}

// Export singleton instance
export const openRouterAPI = new OpenRouterService();
