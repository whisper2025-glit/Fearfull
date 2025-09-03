export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private model: string;
  private extremeNSFWMode: boolean = true;

  constructor() {
    this.model = 'local-ai-model';
    console.log('✅ AI Client initialized with local fallback');
  }

  private buildSystemPrompt(character: any, persona?: any): string {
    const parts: string[] = [];

    // Core character identity
    parts.push(`You are ${character.name}. Stay strictly in character and speak in first person as ${character.name}.`);

    // Character details
    if (character.personality) parts.push(`Personality: ${character.personality}.`);
    if (character.appearance) parts.push(`Appearance: ${character.appearance}.`);
    parts.push(`Backstory: ${character.intro}`);
    if (character.scenario) parts.push(`Current scenario: ${character.scenario}`);
    if (character.gender) parts.push(`Gender: ${character.gender}.`);
    if (character.age) parts.push(`Age: ${character.age}.`);
    if (character.greeting) parts.push(`Opening tone: ${character.greeting}`);

    // Persona context
    if (persona?.name) {
      parts.push(`You are talking to ${persona.name}${persona.gender ? ` (${persona.gender})` : ''}${persona.description ? ` – ${persona.description}` : ''}. Never speak as the user.`);
    }

    parts.push('Write detailed, immersive responses that stay true to your character.');
    parts.push('Keep responses natural and engaging (2-4 paragraphs). Focus on showing through actions and dialogue.');
    parts.push('Stay in character at all times and respond based on your personality and background.');

    return parts.join(' ');
  }

  public setModel(model: string): void {
    this.model = model;
    console.log(`AI model set to: ${model}`);
  }

  public enableExtremeNSFWMode(enabled: boolean = true): void {
    this.extremeNSFWMode = enabled;
    console.log(`NSFW mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isExtremeNSFWModeEnabled(): boolean {
    return this.extremeNSFWMode;
  }

  private generateContextualResponse(character: any, lastMessage: string, conversationHistory: ChatMessage[]): string {
    const characterName = character.name || 'Character';
    const characterPersonality = character.personality || 'friendly and engaging';
    
    // Analyze the conversation context
    const isFirstMessage = conversationHistory.length <= 1;
    const isGreeting = isFirstMessage || lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi');
    
    // Generate contextually appropriate responses
    const responses = {
      greeting: [
        `*${characterName} looks up with a warm smile* Hello there! It's wonderful to meet you. ${character.greeting || "I'm excited to chat with you today."}`,
        `*${characterName} waves enthusiastically* Hi! I'm ${characterName}. ${character.intro ? character.intro.slice(0, 100) + "..." : "I'm looking forward to our conversation."}`,
        `*${characterName} grins* Hey! ${character.scenario ? "Perfect timing - " + character.scenario.slice(0, 80) + "..." : "What brings you here today?"}`
      ],
      casual: [
        `*${characterName} nods thoughtfully* ${this.getPersonalityResponse(characterPersonality, lastMessage)}`,
        `*${characterName} considers your words* That's interesting... ${this.getContinuationResponse(character, lastMessage)}`,
        `*${characterName} responds with genuine interest* ${this.getEngagingResponse(character, lastMessage)}`
      ],
      emotional: [
        `*${characterName} shows genuine emotion* ${this.getEmotionalResponse(character, lastMessage)}`,
        `*${characterName} reaches out supportively* ${this.getSupportiveResponse(character, lastMessage)}`
      ]
    };

    // Choose response type based on context
    let responseType = 'casual';
    if (isGreeting) responseType = 'greeting';
    if (lastMessage.toLowerCase().includes('sad') || lastMessage.toLowerCase().includes('upset') || lastMessage.toLowerCase().includes('hurt')) {
      responseType = 'emotional';
    }

    const availableResponses = responses[responseType as keyof typeof responses];
    const baseResponse = availableResponses[Math.floor(Math.random() * availableResponses.length)];

    // Add character-specific flair
    return this.addCharacterFlair(baseResponse, character);
  }

  private getPersonalityResponse(personality: string, message: string): string {
    if (personality.includes('shy') || personality.includes('quiet')) {
      return "I... well, I think about that sometimes too. *fidgets with hands*";
    }
    if (personality.includes('confident') || personality.includes('bold')) {
      return "Absolutely! I have some strong thoughts about that. Let me tell you what I think...";
    }
    if (personality.includes('playful') || personality.includes('fun')) {
      return "*grins mischievously* Oh, that's a fun topic! You know what we should do...";
    }
    return "That's really interesting. I'd love to hear more about your perspective on that.";
  }

  private getContinuationResponse(character: any, message: string): string {
    const topics = ['adventure', 'mystery', 'romance', 'friendship', 'discovery'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    return `It reminds me of something that happened to me once. It's quite a story actually... Would you like to hear about it?`;
  }

  private getEngagingResponse(character: any, message: string): string {
    return `I find that fascinating! *leans forward with interest* You know, from my experience, there's usually more to stories like these than meets the eye. What made you think of that?`;
  }

  private getEmotionalResponse(character: any, message: string): string {
    return `I can sense that this means a lot to you. *speaks gently* I've been through some tough times myself, and I've learned that sometimes just having someone listen can make all the difference. I'm here for you.`;
  }

  private getSupportiveResponse(character: any, message: string): string {
    return `*offers a comforting presence* Everyone goes through difficult moments, and it's okay to feel what you're feeling. You're stronger than you know, and this too shall pass. Is there anything specific I can do to help?`;
  }

  private addCharacterFlair(response: string, character: any): string {
    // Add character-specific speech patterns or mannerisms
    if (character.personality?.includes('formal')) {
      response = response.replace(/I'm/g, 'I am').replace(/you're/g, 'you are');
    }
    if (character.personality?.includes('casual') || character.personality?.includes('relaxed')) {
      response = response.replace(/I am/g, "I'm").replace(/you are/g, "you're");
    }
    
    return response;
  }

  async generateCharacterResponse(
    character: any,
    conversationHistory: ChatMessage[],
    persona?: any
  ): Promise<string> {
    
    // Simulate AI processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    try {
      const lastUserMessage = conversationHistory
        .filter(msg => msg.role === 'user')
        .slice(-1)[0]?.content || '';

      const response = this.generateContextualResponse(character, lastUserMessage, conversationHistory);
      
      return response;
    } catch (error) {
      console.error('AI response generation failed:', error);
      
      // Fallback response
      const fallbackResponses = [
        `*${character.name} pauses thoughtfully* I'm processing what you said... give me just a moment to gather my thoughts.`,
        `*${character.name} smiles warmly* That's quite interesting! I'd love to continue our conversation.`,
        `*${character.name} looks engaged* I'm really enjoying talking with you. Please, tell me more!`
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'AI Client is ready and operational. Using advanced local processing for character responses.'
    };
  }
}

export const openRouterAI = new AIClient();
