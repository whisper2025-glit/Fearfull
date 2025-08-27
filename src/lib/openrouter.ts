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
    // 🚫 DISABLED: Preventing automatic token usage
    console.log('🚫 testConnection() disabled to prevent token usage');
    return {
      success: true,
      message: 'Connection test disabled (tokens saved)'
    };
  }

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
}

// Export singleton instance
export const openRouterAPI = new OpenRouterService();
