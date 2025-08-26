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
    this.validateApiKey();
  }

  private validateApiKey(): void {
    if (!this.apiKey.startsWith('sk-or-v1-')) {
      console.warn('OpenRouter API key format may be incorrect. Expected format: sk-or-v1-...');
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
      console.log('OpenRouter API - Making request to:', `${this.baseURL}/chat/completions`);
      console.log('OpenRouter API - Model:', model.name);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
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

      console.log('OpenRouter API - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API - Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }

        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || errorText || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('OpenRouter API - Success response received');
      return result;
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
        headers: this.getHeaders(),
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
      console.log('OpenRouter API - Testing connection...');
      console.log('OpenRouter API - API Key available:', !!this.apiKey);
      console.log('OpenRouter API - API Key starts with:', this.apiKey?.substring(0, 10) + '...');

      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hi' }
      ];

      // Use a more reliable free model for testing
      const testModel: Model = {
        id: 'test',
        name: 'mistralai/mistral-7b-instruct:free',
        author: 'Mistral AI',
        description: 'Test',
        price: 0,
        responseTime: '850 ms',
        memory: '7B',
        rating: 8.5,
        tags: ['Test'],
        isActive: true,
        isPremium: false,
        isMain: true,
        provider: 'mistral',
        tier: 'standard'
      };

      const response = await this.createChatCompletion(testModel, testMessages, { max_tokens: 10 });
      console.log('OpenRouter API - Test successful, response received');
      return true;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const openRouterAPI = new OpenRouterAPI();
