export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseURL = 'https://openrouter.ai/api/v1';
  private readonly model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.model = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/auto';
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Roleplay Chat',
    };
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY.');
    }
    if (!this.apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid OpenRouter API key format. It should start with "sk-or-v1-"');
    }
  }

  // No system prompts added; forwards conversation history as-is
  async generateCharacterResponse(
    _character: any,
    conversationHistory: ChatMessage[],
    _persona?: any
  ): Promise<string> {
    this.validateApiKey();

    const messages: ChatMessage[] = [...conversationHistory];

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

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let msg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const err = await response.json();
        msg = err?.error?.message || err?.message || msg;
      } catch {}
      throw new Error(`OpenRouter API Error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm having trouble responding right now.";
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      this.validateApiKey();
      const res = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (res.ok) return { success: true, message: 'OpenRouter connection successful' };
      return { success: false, message: `API connection failed: ${res.status} ${res.statusText}` };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const openRouterAI = new OpenRouterClient();
