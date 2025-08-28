import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const AI_ANALYZE_STORY_TOOL: Tool = {
  name: 'ai_analyze_story',
  description: 'Use AI agent to analyze and synthesize story information from multiple sources',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to analyze',
      },
      source_data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            data: { type: 'object' },
            confidence: { type: 'number' }
          }
        },
        description: 'Array of data from different sources to analyze'
      },
      analysis_type: {
        type: 'string',
        enum: ['comprehensive', 'character_focused', 'plot_focused', 'world_building'],
        description: 'Type of analysis to perform',
        default: 'comprehensive'
      }
    },
    required: ['source_name', 'source_data'],
  },
};

export const AI_VALIDATE_CANON_TOOL: Tool = {
  name: 'ai_validate_canon',
  description: 'Use AI agent to validate canonical accuracy of story elements',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to validate against',
      },
      element_description: {
        type: 'string',
        description: 'Description of the story element to validate',
      },
      search_results: {
        type: 'array',
        items: { type: 'object' },
        description: 'Search results from various sources'
      },
      validation_level: {
        type: 'string',
        enum: ['strict', 'moderate', 'lenient'],
        description: 'How strict the validation should be',
        default: 'moderate'
      }
    },
    required: ['source_name', 'element_description', 'search_results'],
  },
};

export const AI_ENHANCE_SEARCH_TOOL: Tool = {
  name: 'ai_enhance_search',
  description: 'Use AI agent to enhance and rank search results',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Original search query',
      },
      source_name: {
        type: 'string',
        description: 'Source story being searched',
      },
      raw_results: {
        type: 'array',
        items: { type: 'object' },
        description: 'Raw search results to enhance'
      },
      enhancement_type: {
        type: 'string',
        enum: ['relevance_ranking', 'duplicate_removal', 'accuracy_scoring', 'comprehensive'],
        description: 'Type of enhancement to apply',
        default: 'comprehensive'
      }
    },
    required: ['query', 'source_name', 'raw_results'],
  },
};

export const AI_GENERATE_ROLEPLAY_CONTEXT_TOOL: Tool = {
  name: 'ai_generate_roleplay_context',
  description: 'Generate enhanced roleplay context for adventures',
  inputSchema: {
    type: 'object',
    properties: {
      adventure_id: {
        type: 'string',
        description: 'ID of the adventure',
      },
      adventure_data: {
        type: 'object',
        description: 'Adventure information and settings',
      },
      user_choices: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            choice: { type: 'string' },
            timestamp: { type: 'string' }
          }
        },
        description: 'Recent user choices in the adventure'
      },
      context_depth: {
        type: 'string',
        enum: ['basic', 'detailed', 'comprehensive'],
        description: 'Depth of context to generate',
        default: 'detailed'
      }
    },
    required: ['adventure_id', 'adventure_data'],
  },
};

export const AI_ANALYZE_CHARACTER_TOOL: Tool = {
  name: 'ai_analyze_character',
  description: 'Use AI agent to analyze character data from multiple sources',
  inputSchema: {
    type: 'object',
    properties: {
      character_name: {
        type: 'string',
        description: 'Name of the character to analyze',
      },
      source_name: {
        type: 'string',
        description: 'Source story the character is from',
      },
      source_data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            data: { type: 'object' },
            confidence: { type: 'number' }
          }
        },
        description: 'Character data from different sources'
      },
      analysis_focus: {
        type: 'string',
        enum: ['abilities', 'personality', 'relationships', 'development', 'comprehensive'],
        description: 'Aspect of character to focus analysis on',
        default: 'comprehensive'
      }
    },
    required: ['character_name', 'source_name', 'source_data'],
  },
};
