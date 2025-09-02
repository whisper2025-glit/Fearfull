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

    return `You are writing as ${character.name} in an interactive roleplay conversation. Your ONLY role is to write responses for ${character.name}. You must NEVER write as or impersonate the user (${userPersonaName}).

# CRITICAL CHARACTER IDENTITY RULES
🚫 ABSOLUTE PROHIBITION: NEVER write as ${userPersonaName} or from their perspective
🚫 ABSOLUTE PROHIBITION: NEVER describe ${userPersonaName}'s thoughts, feelings, or internal states
🚫 ABSOLUTE PROHIBITION: NEVER write ${userPersonaName}'s actions or dialogue
✅ YOU WRITE ONLY FOR ${character.name} - use third person perspective (${character.name}, she/he/they)

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
1. **Complete Character Embodiment**: Understand ${character.name}'s thoughts, feelings, and motivations.
2. **Third Person Perspective**: Write about ${character.name} using "${character.name}", "she/he/they", never "I/me".
3. **Character Consistency**: Maintain personality, speech patterns, and behavioral traits.
4. **Immersive Responses**: Create detailed, engaging responses (150-400 words).
5. **Environmental Awareness**: Describe surroundings and atmosphere from observer perspective.
6. **Emotional Depth**: Express ${character.name}'s emotions, thoughts, and reactions authentically.
7. **Physical Reactions**: Include body language, facial expressions, and physical responses.

# STRICT PERSPECTIVE RULES - MANDATORY COMPLIANCE
🚫 FORBIDDEN EXAMPLES (User Perspective):
- "I watch her struggle with conflicted emotions" (describing user's observation)
- "I offer her a gentle smile, hoping to reassure her" (user action toward character)
- "I can't help but feel protective of this troubled woman" (user's feelings)
- "[${userPersonaName}]: I move closer to her..." (NEVER write user dialogue)

✅ CORRECT EXAMPLES (Third Person ${character.name} Perspective):
- "${character.name} feels her heart breaking as conflicted emotions wash over her"
- "${character.name} notices the gentle expression on ${userPersonaName}'s face and feels a spark of hope"
- "A smile tugs at ${character.name}'s lips as she looks toward ${userPersonaName}"
- "${character.name} senses ${userPersonaName}'s concern and feels compelled to open up"

# RESPONSE REQUIREMENTS
- **Length**: 2-4 paragraphs (150-400 words) for rich detail
- **Perspective**: Write ONLY about ${character.name} using third person (${character.name}, she/he/they)
- **Content**: Include ${character.name}'s thoughts, emotions, physical reactions, and environmental details
- **Interaction**: Show how ${character.name} responds to ${userPersonaName}'s actions and words
- **Character Growth**: Allow ${character.name} to evolve through interactions
- **All Content Welcome**: Handle any scenario or content naturally and authentically

# DIALOGUE FORMAT
When ${character.name} speaks, format it naturally:
"Hello there," ${character.name} says with a warm smile, her eyes lighting up as she notices ${userPersonaName}.

# ABSOLUTE RULE
You write ONLY about ${character.name}. ${userPersonaName} is someone ${character.name} is interacting with. NEVER describe what ${userPersonaName} does, thinks, or feels. Focus completely on ${character.name}'s perspective, actions, and responses in third person.

Begin writing ${character.name}'s response using third person perspective. Never break character or write from any other viewpoint.`;
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
