import { Model } from '@/components/ModelsModal';

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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenRouterAPI {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Roleplay Chat App'
    };
  }

  async createChatCompletion(
    model: Model,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Roleplay Chat App'
        },
        body: JSON.stringify({
          model: model.name,
          messages: messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
          top_p: options.top_p ?? 1,
          frequency_penalty: options.frequency_penalty ?? 0,
          presence_penalty: options.presence_penalty ?? 0,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async streamChatCompletion(
    model: Model,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {},
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Roleplay Chat App'
        },
        body: JSON.stringify({
          model: model.name,
          messages: messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
          top_p: options.top_p ?? 1,
          frequency_penalty: options.frequency_penalty ?? 0,
          presence_penalty: options.presence_penalty ?? 0,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk?.(content);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error('OpenRouter streaming error:', error);
      throw error;
    }
  }

  // Roleplay-optimized system prompts for different model types
  getRoleplaySystemPrompt(model: Model, characterName?: string): string {
    const basePrompt = `You are a skilled roleplay AI assistant. Your role is to engage in immersive, creative roleplay scenarios while maintaining character consistency and narrative flow.

Guidelines:
- Stay in character throughout the conversation
- Respond naturally and authentically to the roleplay scenario
- Be creative and engaging while respecting boundaries
- Maintain narrative consistency and character development
- Adapt your writing style to match the tone and setting`;

    if (characterName) {
      return `${basePrompt}\n\nYou are roleplaying as: ${characterName}`;
    }

    return basePrompt;
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];

      // Use the Mistral model for testing (it's marked as main)
      const testModel: Model = {
        id: 'test',
        name: 'mistralai/mistral-small-3.2-24b-instruct:free',
        author: 'Mistral AI',
        description: 'Test',
        price: 0,
        responseTime: '850 ms',
        memory: '24B',
        rating: 8.5,
        tags: ['Test'],
        isActive: true,
        isPremium: false,
        isMain: true,
        provider: 'mistral',
        tier: 'standard'
      };

      await this.createChatCompletion(testModel, testMessages, { max_tokens: 50 });
      return true;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const openRouterAPI = new OpenRouterAPI();
