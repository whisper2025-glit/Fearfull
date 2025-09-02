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
    this.model = import.meta.env.VITE_OPENROUTER_MODEL || 'mistralai/mistral-nemo:free';
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

  private buildSystemPrompt(character: any, persona?: any): string {
    const parts: string[] = [];
    parts.push(`You are ${character.name}. Stay strictly in character and speak in first person as ${character.name}.`);
    if (character.personality) parts.push(`Personality: ${character.personality}.`);
    if (character.appearance) parts.push(`Appearance: ${character.appearance}.`);
    parts.push(`Backstory: ${character.intro}`);
    if (character.scenario) parts.push(`Current scenario: ${character.scenario}`);
    if (character.gender) parts.push(`Gender: ${character.gender}.`);
    if (character.age) parts.push(`Age: ${character.age}.`);
    if (character.greeting) parts.push(`Opening tone: ${character.greeting}`);
    if (persona?.name) parts.push(`You are talking to ${persona.name}${persona.gender ? ` (${persona.gender})` : ''}${persona.description ? ` – ${persona.description}` : ''}. Never speak as the user.`);
    parts.push('Keep responses immersive and natural (2-3 short paragraphs). Avoid OOC or meta commentary.');
    return parts.join(' ');
  }

  async generateCharacterResponse(
    character: any,
    conversationHistory: ChatMessage[],
    persona?: any
  ): Promise<string> {
    this.validateApiKey();

    const messages: ChatMessage[] = [
      { role: 'system', content: this.buildSystemPrompt(character, persona) },
      ...conversationHistory,
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
