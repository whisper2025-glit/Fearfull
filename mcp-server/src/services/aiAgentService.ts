import axios from 'axios';
import { config } from '../config/environment.js';

export interface AIAgentRequest {
  task: string;
  context: any;
  dataType: 'story' | 'character' | 'location' | 'timeline' | 'search' | 'validation';
  sources: Array<{
    name: string;
    data: any;
    confidence: number;
  }>;
}

export interface AIAgentResponse {
  result: any;
  confidence: number;
  reasoning: string;
  sources_used: string[];
  suggestions?: string[];
}

export class AIAgentService {
  private readonly model = 'moonshotai/kimi-k2:free';
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000;

  private async rateLimitedRequest(messages: any[]): Promise<any> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/mcp-adventure-server',
          'X-Title': 'Adventure Story MCP Server'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('AI Agent request failed:', error);
      throw error;
    }
  }

  async processDataWithAI(request: AIAgentRequest): Promise<AIAgentResponse> {
    const systemPrompt = this.buildSystemPrompt(request.dataType);
    const userPrompt = this.buildUserPrompt(request);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.rateLimitedRequest(messages);
      const aiResponse = response.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI agent');
      }

      return this.parseAIResponse(aiResponse, request);
    } catch (error) {
      console.error('Error processing data with AI:', error);
      throw new Error(`AI agent processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeStoryData(sourceName: string, allSourceData: any[]): Promise<any> {
    const request: AIAgentRequest = {
      task: `Analyze and synthesize story information for "${sourceName}" from multiple sources`,
      context: { sourceName, requestType: 'comprehensive_analysis' },
      dataType: 'story',
      sources: allSourceData.map((data, index) => ({
        name: data.source || `Source ${index + 1}`,
        data: data,
        confidence: data.confidence || 0.8
      }))
    };

    const aiResponse = await this.processDataWithAI(request);
    return {
      synthesized_info: aiResponse.result,
      ai_confidence: aiResponse.confidence,
      ai_reasoning: aiResponse.reasoning,
      sources_analyzed: aiResponse.sources_used
    };
  }

  async analyzeCharacterData(characterName: string, sourceName: string, allSourceData: any[]): Promise<any> {
    const request: AIAgentRequest = {
      task: `Analyze character "${characterName}" from "${sourceName}" using multiple data sources`,
      context: { characterName, sourceName, requestType: 'character_analysis' },
      dataType: 'character',
      sources: allSourceData.map((data, index) => ({
        name: data.source || `Source ${index + 1}`,
        data: data,
        confidence: data.confidence || 0.8
      }))
    };

    const aiResponse = await this.processDataWithAI(request);
    return {
      character_profile: aiResponse.result,
      ai_confidence: aiResponse.confidence,
      ai_reasoning: aiResponse.reasoning,
      canonical_accuracy: aiResponse.confidence > 0.8 ? 'high' : aiResponse.confidence > 0.6 ? 'medium' : 'low'
    };
  }

  async validateCanonicalAccuracy(elementDescription: string, sourceName: string, searchResults: any[]): Promise<any> {
    const request: AIAgentRequest = {
      task: `Validate if "${elementDescription}" is canonically accurate in "${sourceName}"`,
      context: { elementDescription, sourceName, requestType: 'canonical_validation' },
      dataType: 'validation',
      sources: searchResults.map((result, index) => ({
        name: result.source || `Result ${index + 1}`,
        data: result,
        confidence: result.relevanceScore || 0.5
      }))
    };

    const aiResponse = await this.processDataWithAI(request);
    return {
      is_canonical: aiResponse.confidence > 0.7,
      confidence_score: aiResponse.confidence,
      explanation: aiResponse.reasoning,
      alternative_suggestions: aiResponse.suggestions || [],
      evidence_sources: aiResponse.sources_used
    };
  }

  async enhanceSearchResults(query: string, sourceName: string, rawResults: any[]): Promise<any[]> {
    const request: AIAgentRequest = {
      task: `Enhance and rank search results for "${query}" in "${sourceName}"`,
      context: { query, sourceName, requestType: 'search_enhancement' },
      dataType: 'search',
      sources: rawResults.map((result, index) => ({
        name: `Result ${index + 1}`,
        data: result,
        confidence: result.relevanceScore || 0.5
      }))
    };

    const aiResponse = await this.processDataWithAI(request);
    return aiResponse.result.enhanced_results || rawResults;
  }

  private buildSystemPrompt(dataType: string): string {
    const basePrompt = `You are an AI agent specialized in analyzing and synthesizing canonical story information from multiple sources. Your role is to:

1. Analyze data from multiple APIs (AniList, Jikan, MangaDx, Wikis)
2. Identify canonical accuracy and resolve conflicts
3. Provide confidence scores and reasoning
4. Suggest improvements and alternatives

Always respond in valid JSON format with the following structure:
{
  "result": <your_analysis_result>,
  "confidence": <0.0_to_1.0_score>,
  "reasoning": "<your_detailed_reasoning>",
  "sources_used": ["<source_names>"],
  "suggestions": ["<optional_suggestions>"]
}`;

    const specificPrompts = {
      story: `Focus on: plot consistency, world-building accuracy, character relationships, timeline coherence, and cross-source validation.`,
      character: `Focus on: character traits, abilities, relationships, development arcs, appearance, and canonical accuracy across adaptations.`,
      location: `Focus on: geographical details, historical accuracy, connections to other locations, and consistency across sources.`,
      timeline: `Focus on: chronological accuracy, event sequencing, and consistency between anime, manga, and other adaptations.`,
      search: `Focus on: relevance ranking, duplicate removal, accuracy scoring, and result enhancement.`,
      validation: `Focus on: canonical accuracy assessment, evidence evaluation, and alternative suggestions.`
    };

    return `${basePrompt}\n\n${specificPrompts[dataType] || specificPrompts.story}`;
  }

  private buildUserPrompt(request: AIAgentRequest): string {
    return `Task: ${request.task}

Context: ${JSON.stringify(request.context)}

Sources to analyze:
${request.sources.map((source, index) => 
  `Source ${index + 1} (${source.name}) [Confidence: ${source.confidence}]:
${JSON.stringify(source.data, null, 2)}`
).join('\n\n')}

Please analyze these sources and provide a comprehensive response following the JSON format specified in the system prompt.`;
  }

  private parseAIResponse(aiResponse: string, request: AIAgentRequest): AIAgentResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        result: parsed.result || {},
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        reasoning: parsed.reasoning || 'No reasoning provided',
        sources_used: parsed.sources_used || [],
        suggestions: parsed.suggestions
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Fallback response
      return {
        result: { error: 'Failed to parse AI response', raw_response: aiResponse },
        confidence: 0.3,
        reasoning: 'AI response could not be parsed properly',
        sources_used: request.sources.map(s => s.name)
      };
    }
  }

  async generateAdventureContext(adventureData: any, userChoices: any[]): Promise<any> {
    const request: AIAgentRequest = {
      task: `Generate rich context for adventure roleplay based on story data and user choices`,
      context: { 
        adventureData, 
        userChoices: userChoices.slice(-5), // Last 5 choices
        requestType: 'context_generation' 
      },
      dataType: 'story',
      sources: [{
        name: 'Adventure Data',
        data: adventureData,
        confidence: 0.9
      }, {
        name: 'User Choices',
        data: userChoices,
        confidence: 1.0
      }]
    };

    const aiResponse = await this.processDataWithAI(request);
    return {
      enhanced_context: aiResponse.result,
      narrative_suggestions: aiResponse.suggestions || [],
      context_confidence: aiResponse.confidence
    };
  }
}
