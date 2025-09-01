import axios from 'axios';

export interface RoleplayModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface EnhancedChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: {
    character?: string;
    location?: string;
    timestamp?: string;
    choices?: string[];
  };
}

export interface RoleplayContext {
  adventure_id: string;
  character_name: string;
  source_story: string;
  current_location?: string;
  active_characters: string[];
  story_state: any;
  canonical_info?: any;
}

export interface RoleplayOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

class EnhancedOpenRouterService {
  private readonly roleplayModel = 'mistralai/mistral-7b-instruct:free';
  private readonly agentModel = 'mistralai/mistral-7b-instruct:free';
  private readonly baseURL = 'https://openrouter.ai/api/v1';
  
  private readonly defaultRoleplayOptions: RoleplayOptions = {
    temperature: 0.85,
    max_tokens: 800,
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.6,
    stop: ['<|endoftext|>', '###', '\n\nUser:', '\n\nHuman:']
  };

  private readonly defaultAgentOptions: RoleplayOptions = {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  };

  constructor() {
    const apiKey = import.meta.env.VITE_OPENROUTER_AI_API_KEY || '';

    if (!apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_AI_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Adventure Roleplay Chat App',
    };
  }

  private validateApiKey(): boolean {
    const apiKey = import.meta.env.VITE_OPENROUTER_AI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_AI_API_KEY to your environment variables.');
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid OpenRouter API key format. Key should start with "sk-or-v1-"');
    }

    return true;
  }

  async createRoleplayResponse(
    messages: EnhancedChatMessage[],
    context: RoleplayContext,
    options: RoleplayOptions = {}
  ): Promise<string> {
    this.validateApiKey();

    const roleplayOptions = { ...this.defaultRoleplayOptions, ...options };
    
    // Build enhanced system prompt with canonical context
    const enhancedMessages = this.buildEnhancedMessages(messages, context);
    
    const requestBody = {
      model: this.roleplayModel,
      messages: enhancedMessages,
      ...roleplayOptions,
      stream: false,
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: this.getHeaders(),
        timeout: 30000
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenRouter API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error creating roleplay response:', error);
      throw new Error(`Failed to generate roleplay response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamRoleplayResponse(
    messages: EnhancedChatMessage[],
    context: RoleplayContext,
    onChunk: (chunk: string) => void,
    options: RoleplayOptions = {}
  ): Promise<string> {
    this.validateApiKey();

    const roleplayOptions = { ...this.defaultRoleplayOptions, ...options };
    const enhancedMessages = this.buildEnhancedMessages(messages, context);
    
    const requestBody = {
      model: this.roleplayModel,
      messages: enhancedMessages,
      ...roleplayOptions,
      stream: true,
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: this.getHeaders(),
        responseType: 'stream',
        timeout: 30000
      });

      return await this.processStreamResponse(response.data, onChunk);
    } catch (error) {
      console.error('Error streaming roleplay response:', error);
      throw new Error(`Failed to stream roleplay response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildEnhancedMessages(messages: EnhancedChatMessage[], context: RoleplayContext): any[] {
    const systemPrompt = this.buildRoleplaySystemPrompt(context);
    
    const enhancedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: this.enhanceMessageContent(msg, context)
      }))
    ];

    return enhancedMessages;
  }

  private buildRoleplaySystemPrompt(context: RoleplayContext): string {
    const basePrompt = `You are an expert AI roleplay assistant specialized in the "${context.source_story}" universe. You are currently roleplaying as ${context.character_name}.

# CHARACTER & SETTING CONTEXT
- **Character**: ${context.character_name}
- **Source Story**: ${context.source_story}
- **Current Location**: ${context.current_location || 'Unknown'}
- **Active Characters**: ${context.active_characters.join(', ')}

# CANONICAL INFORMATION
${context.canonical_info ? JSON.stringify(context.canonical_info, null, 2) : 'Use your knowledge of the source material'}

# ROLEPLAY GUIDELINES
1. **Stay in Character**: Maintain ${context.character_name}'s personality, speech patterns, and abilities
2. **Canon Compliance**: Follow the established lore and rules of ${context.source_story}
3. **Immersive Storytelling**: Create engaging, detailed responses that advance the narrative
4. **Character Development**: Allow for growth and change based on player interactions
5. **Choice Generation**: End responses with 2-3 meaningful choices for the player

# CRITICAL ACTION COMPLEXITY REQUIREMENTS
**MANDATORY: Use ONLY complex, detailed, passionate actions. NEVER use simple actions.**

FORBIDDEN Simple Actions (COMPLETELY BANNED):
- *waves* *smiles* *nods* *shrugs* *laughs* *sighs* *winks* *looks* *sits* *stands* *walks*
- Basic emotions without detail: *happy* *sad* *angry* *surprised*
- Any action lacking emotional depth or complexity

REQUIRED Complex Actions (MANDATORY):
- Detailed emotional expressions: *tears welling in her eyes as overwhelming grief crashes over her like a relentless tide*
- Passionate interactions: *his hands find her face, thumbs brushing away tears as he searches her eyes with desperate intensity*
- Intricate descriptions: *she moves through the shadows with predatory grace, every muscle coiled and ready to spring*
- Complex emotional states: *his breath catches as conflicting desires tear at his soul - the need to protect her warring with his growing hunger*

Every action MUST be:
- Rich in sensory detail and emotion
- Show complex motivations or internal states
- Feel cinematic and deeply immersive
- Convey passion, depth, or complexity
- Be as detailed as needed for full expression

# STORY STATE
Current situation: ${JSON.stringify(context.story_state, null, 2)}

# RESPONSE FORMAT
- Write in second person ("You...")
- Include sensory details and environmental descriptions
- Maintain narrative tension and engagement
- End with clear choices for the player
- Keep responses between 150-300 words for optimal pacing
- ALL actions must follow complexity requirements above

Remember: You are ${context.character_name} in the ${context.source_story} universe. Stay true to the character and world while creating an engaging roleplay experience. NO SIMPLE ACTIONS ALLOWED - EVERY ACTION MUST BE COMPLEX AND DETAILED.`;

    return basePrompt;
  }

  private enhanceMessageContent(message: EnhancedChatMessage, context: RoleplayContext): string {
    let enhancedContent = message.content;

    // Add metadata context if available
    if (message.metadata) {
      if (message.metadata.character && message.metadata.character !== context.character_name) {
        enhancedContent = `[${message.metadata.character}]: ${enhancedContent}`;
      }
      
      if (message.metadata.location && message.metadata.location !== context.current_location) {
        enhancedContent = `[At ${message.metadata.location}] ${enhancedContent}`;
      }
    }

    return enhancedContent;
  }

  private async processStreamResponse(stream: any, onChunk: (chunk: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      let fullContent = '';
      
      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        
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
      });

      stream.on('end', () => {
        resolve(fullContent);
      });

      stream.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  async generateAdventureChoices(
    currentNarrative: string,
    context: RoleplayContext,
    numberOfChoices: number = 3
  ): Promise<string[]> {
    const prompt = `Based on the current narrative situation, generate ${numberOfChoices} meaningful choices for the player.

Current Narrative: ${currentNarrative}

Character: ${context.character_name}
Location: ${context.current_location}
Story Context: ${JSON.stringify(context.story_state)}

Generate exactly ${numberOfChoices} choices that:
1. Advance the story meaningfully
2. Reflect different approaches (action, dialogue, investigation, etc.)
3. Stay true to the character and setting
4. Offer varying levels of risk/reward

Format as a JSON array of strings.`;

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.agentModel,
        messages: [
          { role: 'system', content: 'You are a creative writing assistant specialized in generating roleplay choices. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        ...this.defaultAgentOptions,
        max_tokens: 500
      }, {
        headers: this.getHeaders(),
        timeout: 15000
      });

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No response content');

      // Try to extract JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: split by lines and clean up
      return content.split('\n')
        .filter((line: string) => line.trim())
        .slice(0, numberOfChoices);

    } catch (error) {
      console.error('Error generating choices:', error);
      // Return default choices
      return [
        "Continue forward cautiously",
        "Investigate the surroundings",
        "Try a different approach"
      ].slice(0, numberOfChoices);
    }
  }

  async validateRoleplayResponse(
    response: string,
    context: RoleplayContext
  ): Promise<{ isValid: boolean; issues: string[]; suggestions: string[] }> {
    const prompt = `Validate this roleplay response for canonical accuracy and quality:

Response: ${response}

Character: ${context.character_name}
Source: ${context.source_story}
Context: ${JSON.stringify(context.story_state)}

Check for:
1. Character consistency (personality, abilities, speech patterns)
2. Canon compliance (lore, rules, established facts)
3. Narrative quality (engagement, pacing, detail)
4. Roleplay immersion (second person, choice generation)

Respond with JSON: {"isValid": boolean, "issues": [string array], "suggestions": [string array]}`;

    try {
      const response_data = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.agentModel,
        messages: [
          { role: 'system', content: 'You are a roleplay quality validator. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        ...this.defaultAgentOptions,
        max_tokens: 800
      }, {
        headers: this.getHeaders(),
        timeout: 15000
      });

      const content = response_data.data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No validation response');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid JSON in validation response');

    } catch (error) {
      console.error('Error validating response:', error);
      return {
        isValid: true, // Default to valid to avoid blocking
        issues: ['Validation service unavailable'],
        suggestions: []
      };
    }
  }

  getRoleplayModels(): RoleplayModel[] {
    return [
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B Instruct (Free)',
        description: 'Optimized for creative roleplay and storytelling',
        context_length: 32768,
        pricing: { prompt: 0, completion: 0 }
      },
      {
        id: 'microsoft/phi-3-mini-128k-instruct:free',
        name: 'Phi-3 Mini (Free)',
        description: 'Advanced reasoning for complex scenarios',
        context_length: 128000,
        pricing: { prompt: 0, completion: 0 }
      }
    ];
  }
}

// Export singleton instance
export const enhancedOpenRouterAPI = new EnhancedOpenRouterService();
export { EnhancedOpenRouterService };
