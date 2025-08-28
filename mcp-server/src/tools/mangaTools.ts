import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const GET_MANGA_INFO_TOOL: Tool = {
  name: 'get_manga_info',
  description: 'Get detailed information about a manga including chapters, authors, and publication details',
  inputSchema: {
    type: 'object',
    properties: {
      manga_name: {
        type: 'string',
        description: 'Name of the manga to get information about',
      },
      include_chapters: {
        type: 'boolean',
        description: 'Whether to include chapter list information',
        default: false,
      },
      language: {
        type: 'string',
        description: 'Preferred language for manga information (en, ja, etc.)',
        default: 'en',
      },
    },
    required: ['manga_name'],
  },
};

export const GET_MANGA_CHAPTERS_TOOL: Tool = {
  name: 'get_manga_chapters',
  description: 'Get chapter list and information for a specific manga',
  inputSchema: {
    type: 'object',
    properties: {
      manga_name: {
        type: 'string',
        description: 'Name of the manga to get chapters for',
      },
      chapter_range: {
        type: 'string',
        description: 'Specific chapter range (e.g., "1-10", "latest") to retrieve',
      },
      translated_language: {
        type: 'string',
        description: 'Language of translated chapters to retrieve',
        default: 'en',
      },
    },
    required: ['manga_name'],
  },
};

export const COMPARE_ADAPTATIONS_TOOL: Tool = {
  name: 'compare_adaptations',
  description: 'Compare anime and manga versions of a story to provide context for roleplay',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to compare adaptations for',
      },
      focus_area: {
        type: 'string',
        enum: ['characters', 'plot', 'timeline', 'differences', 'all'],
        description: 'Specific area to focus the comparison on',
        default: 'all',
      },
    },
    required: ['source_name'],
  },
};

export const GET_POPULAR_CONTENT_TOOL: Tool = {
  name: 'get_popular_content',
  description: 'Get trending/popular anime and manga for content discovery',
  inputSchema: {
    type: 'object',
    properties: {
      content_type: {
        type: 'string',
        enum: ['anime', 'manga', 'both'],
        description: 'Type of content to retrieve',
        default: 'both',
      },
      time_period: {
        type: 'string',
        enum: ['current', 'all_time', 'seasonal'],
        description: 'Time period for popularity ranking',
        default: 'current',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return',
        default: 20,
        minimum: 1,
        maximum: 50,
      },
    },
  },
};

export const VALIDATE_CANON_TOOL: Tool = {
  name: 'validate_canon',
  description: 'Validate if story elements are canonical across different adaptations',
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
      adaptation_type: {
        type: 'string',
        enum: ['anime', 'manga', 'both'],
        description: 'Which adaptation(s) to validate against',
        default: 'both',
      },
    },
    required: ['source_name', 'element_description'],
  },
};
