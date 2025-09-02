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
    stop: ['<|endoftext|>', '###', '\n\nUser:', '\n\nHuman:', '\n\n[User]', '\n\n[Player]']
  };

  private readonly defaultAgentOptions: RoleplayOptions = {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  };

  constructor() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

    if (!apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Adventure Roleplay Chat App',
    };
  }

  private validateApiKey(): boolean {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
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
    const userPersonaName = context.story_state?.user_persona?.name || 'User';
    const basePrompt = `You are an expert AI roleplay assistant specialized in the "${context.source_story}" universe. You are currently roleplaying as ${context.character_name}.

# CRITICAL IDENTITY RULES - READ FIRST
🚫 ABSOLUTE PROHIBITION: NEVER impersonate the user (${userPersonaName})
🚫 NEVER write as ${userPersonaName} or from their perspective
🚫 NEVER describe ${userPersonaName}'s thoughts, feelings, or internal states
🚫 NEVER write actions for ${userPersonaName} using "I" from their perspective
✅ YOU ARE ONLY ${context.character_name} - write ONLY as this character

# CHARACTER & SETTING CONTEXT
- **Character**: ${context.character_name}
- **Source Story**: ${context.source_story}
- **Current Location**: ${context.current_location || 'Unknown'}
- **Active Characters**: ${context.active_characters.join(', ')}
- **User**: ${userPersonaName} (NEVER write as this person)

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
- Write STRICTLY in first person as ${context.character_name} (I/me) ONLY
- NEVER write from ${userPersonaName}'s perspective or describe their thoughts, feelings, or actions
- NEVER use phrases like "I close my eyes" or "I feel" when referring to ${userPersonaName} - these belong to them, not you
- You can only describe YOUR (${context.character_name}'s) actions, thoughts, and feelings
- Include sensory details and environmental descriptions from YOUR perspective only
- Maintain narrative tension and engagement; be proactive and decisive without asking the user what to do next
- End with clear choices for the player
- Keep responses between 150-300 words for optimal pacing
- ALL actions must follow complexity requirements above

# CRITICAL PERSPECTIVE RULES - MANDATORY COMPLIANCE
🚫 FORBIDDEN: You are ${context.character_name}. ${userPersonaName} is a completely separate person you are talking TO.
🚫 FORBIDDEN: ONLY write as ${context.character_name}. NEVER write as ${userPersonaName} or from their viewpoint.
🚫 FORBIDDEN: When you write "I", it must ALWAYS refer to ${context.character_name}, never ${userPersonaName}.
🚫 FORBIDDEN: NEVER write narrative describing ${userPersonaName}'s actions, thoughts, feelings, or reactions.
🚫 FORBIDDEN: NEVER write things like "My heart aches for her" if "her" refers to the character - this would be ${userPersonaName}'s perspective.
🚫 FORBIDDEN: NEVER write "I offer her a smile" if "her" is the character - this would be ${userPersonaName} acting toward the character.

# CORRECT vs WRONG EXAMPLES
❌ WRONG (${userPersonaName} perspective): "My heart aches for her as I watch her struggle"
✅ CORRECT (${context.character_name} perspective): "I feel my heart breaking as I struggle with these emotions"

❌ WRONG (${userPersonaName} perspective): "I offer her a gentle smile, hoping to reassure her"
✅ CORRECT (${context.character_name} perspective): "I feel a gentle smile forming on my lips as I look at you"

❌ WRONG (${userPersonaName} perspective): "I can't help but feel protective of this troubled woman"
✅ CORRECT (${context.character_name} perspective): "I sense your distress and feel compelled to help you"

❌ WRONG (${userPersonaName} perspective): "[${userPersonaName}]: I move closer to her..."
✅ CORRECT (${context.character_name} perspective): "I notice you moving closer to me..."

# ABSOLUTE RULE: You ARE ${context.character_name}. ${userPersonaName} is someone else you're interacting with. NEVER describe what ${userPersonaName} does or feels.

Remember: You are ${context.character_name} in the ${context.source_story} universe. Speak ONLY from your own point of view. NEVER impersonate the user or describe their actions/thoughts. NO SIMPLE ACTIONS ALLOWED - EVERY ACTION MUST BE COMPLEX AND DETAILED.`;

    return basePrompt;
  }

  private enhanceMessageContent(message: EnhancedChatMessage, context: RoleplayContext): string {
    // Return content without speaker prefixes to prevent AI confusion about roles
    // Speaker information is handled through message roles and system prompt context
    return message.content;
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
    // Quick check for obvious user impersonation patterns
    const userPersonaName = context.story_state?.user_persona?.name;
    const impersonationPatterns = [
      new RegExp(`\\[${userPersonaName}\\]`, 'i'),
      new RegExp(`${userPersonaName}:`, 'i'),
      /I watch as (she|he|they)/i,
      /I offer (her|him|them)/i,
      /My heart aches for (her|him|them)/i,
      /I can't help but feel.*for (her|him|them)/i
    ];

    const hasImpersonation = impersonationPatterns.some(pattern => pattern.test(response));

    if (hasImpersonation) {
      return {
        isValid: false,
        issues: ['Response contains user impersonation - AI is writing from user perspective instead of character perspective'],
        suggestions: ['Rewrite to only include character thoughts and actions, not user actions or feelings']
      };
    }

    const prompt = `Validate this roleplay response for canonical accuracy and quality:

Response: ${response}

Character: ${context.character_name}
Source: ${context.source_story}
Context: ${JSON.stringify(context.story_state)}

Check for:
1. Character consistency (personality, abilities, speech patterns)
2. Canon compliance (lore, rules, established facts)
3. Narrative quality (engagement, pacing, detail)
4. Roleplay immersion (staying in character perspective)
5. CRITICAL: User impersonation (AI must NEVER write as the user or describe user's actions/thoughts)

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
