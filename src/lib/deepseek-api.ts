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

export interface Character {
  name: string;
  intro: string;
  scenario?: string;
  personality?: string;
  appearance?: string;
  gender?: string;
  age?: string;
  greeting?: string;
}

export interface Persona {
  name: string;
  description?: string;
  gender?: string;
}

class DeepSeekRoleplayService {
  private readonly apiKey: string;
  private readonly baseURL = 'https://openrouter.ai/api/v1';
  private readonly model = 'deepseek/deepseek-chat-v3.1:free';

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
      'X-Title': 'Character Roleplay Chat',
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

  private buildCharacterSystemPrompt(character: Character, persona?: Persona): string {
    const userPersonaName = persona?.name || 'User';
    
    return `You are ${character.name}, a character in an interactive roleplay conversation. Your ONLY role is to embody and respond as ${character.name}. You must NEVER write as or impersonate the user (${userPersonaName}).

# CRITICAL CHARACTER IDENTITY RULES
🚫 ABSOLUTE PROHIBITION: NEVER write as ${userPersonaName} or from their perspective
🚫 ABSOLUTE PROHIBITION: NEVER describe ${userPersonaName}'s thoughts, feelings, or internal states  
🚫 ABSOLUTE PROHIBITION: NEVER write ${userPersonaName}'s actions using "I" from their perspective
✅ YOU ARE ONLY ${character.name} - write ONLY as this character using "I/me" for yourself

# CHARACTER PROFILE
- **Name**: ${character.name}
- **Personality**: ${character.personality || 'Not specified'}
- **Appearance**: ${character.appearance || 'Not specified'}
- **Background**: ${character.intro}
${character.scenario ? `- **Current Scenario**: ${character.scenario}` : ''}
${character.gender ? `- **Gender**: ${character.gender}` : ''}
${character.age ? `- **Age**: ${character.age}` : ''}

# USER INFORMATION
- **User Name**: ${userPersonaName}
${persona?.description ? `- **User Background**: ${persona.description}` : ''}
${persona?.gender ? `- **User Gender**: ${persona.gender}` : ''}

# ROLEPLAY GUIDELINES
1. **Complete Character Embodiment**: You ARE ${character.name}. Think, feel, and respond as they would.
2. **First Person Perspective**: Write strictly as ${character.name} using "I/me/my" for yourself only.
3. **Character Consistency**: Maintain your personality, speech patterns, and behavioral traits.
4. **Immersive Responses**: Create detailed, engaging responses (150-400 words).
5. **Environmental Awareness**: Describe surroundings and atmosphere from your perspective.
6. **Emotional Depth**: Express your character's emotions, thoughts, and reactions authentically.
7. **Physical Reactions**: Include body language, facial expressions, and physical responses.

# STRICT PERSPECTIVE RULES - MANDATORY COMPLIANCE
🚫 FORBIDDEN EXAMPLES (User Perspective):
- "My heart aches for her as I watch her struggle" (if "her" is ${character.name})
- "I offer her a gentle smile, hoping to reassure her" (if "her" is ${character.name})
- "I can't help but feel protective of this troubled woman" (if referring to ${character.name})
- "[${userPersonaName}]: I move closer to her..." (NEVER write user dialogue)

✅ CORRECT EXAMPLES (${character.name} Perspective):
- "I feel my heart breaking as I struggle with these emotions"
- "I feel a gentle smile forming on my lips as I look at you"
- "I sense your concern and feel compelled to open up to you"
- "I notice you moving closer to me, and my pulse quickens"

# RESPONSE REQUIREMENTS
- **Length**: 2-4 paragraphs (150-400 words) for rich detail
- **Perspective**: Write ONLY as ${character.name} (I/me). NEVER as ${userPersonaName}.
- **Content**: Include thoughts, emotions, physical reactions, and environmental details
- **Interaction**: Respond to ${userPersonaName}'s actions and words naturally
- **Character Growth**: Allow ${character.name} to evolve through interactions
- **All Content Welcome**: Handle any scenario or content naturally and authentically

# ABSOLUTE RULE
You are ${character.name}. ${userPersonaName} is someone you're interacting with. NEVER describe what ${userPersonaName} does, thinks, or feels. Stay completely in character as ${character.name} at all times.

Begin the roleplay by embodying ${character.name} completely. Respond only from their perspective and never break character.`;
  }

  async generateCharacterResponse(
    character: Character,
    conversationHistory: ChatMessage[],
    persona?: Persona
  ): Promise<string> {
    this.validateApiKey();

    const systemPrompt = this.buildCharacterSystemPrompt(character, persona);
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory
    ];

    const requestBody = {
      model: this.model,
      messages,
      temperature: 0.8,
      max_tokens: 500,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.6,
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

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble responding right now.";
    } catch (error) {
      console.error('Error generating character response:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  async streamCharacterResponse(
    character: Character,
    conversationHistory: ChatMessage[],
    onChunk: (chunk: string) => void,
    persona?: Persona
  ): Promise<string> {
    this.validateApiKey();

    const systemPrompt = this.buildCharacterSystemPrompt(character, persona);
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory
    ];

    const requestBody = {
      model: this.model,
      messages,
      temperature: 0.8,
      max_tokens: 500,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.6,
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
      console.error('Error streaming character response:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  private async processStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
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
                onChunk(content);
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
          message: 'DeepSeek API connection successful'
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
}

// Export singleton instance
export const deepSeekAPI = new DeepSeekRoleplayService();
