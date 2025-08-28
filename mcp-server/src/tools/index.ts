import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const GET_STORY_INFO_TOOL: Tool = {
  name: 'get_story_info',
  description: 'Get comprehensive information about a story/anime/manga/novel including plot, world-building, and setting details',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story/anime/manga/novel (e.g., "One Piece", "Naruto", "Attack on Titan")',
      },
      setting: {
        type: 'string',
        description: 'Specific setting or arc within the story (e.g., "Wano Arc", "Chunin Exams", "Marley Arc")',
      },
      arc: {
        type: 'string',
        description: 'Specific story arc or season to focus on',
      },
    },
    required: ['source_name'],
  },
};

export const GET_CHARACTER_DATA_TOOL: Tool = {
  name: 'get_character_data',
  description: 'Get detailed information about a specific character including abilities, personality, relationships, and development',
  inputSchema: {
    type: 'object',
    properties: {
      character_name: {
        type: 'string',
        description: 'Name of the character to get information about',
      },
      source_name: {
        type: 'string',
        description: 'Name of the story/anime/manga the character is from',
      },
      arc_context: {
        type: 'string',
        description: 'Specific arc/time period to get character state from (abilities/relationships may change over time)',
      },
    },
    required: ['character_name', 'source_name'],
  },
};

export const GET_LOCATION_DATA_TOOL: Tool = {
  name: 'get_location_data',
  description: 'Get detailed information about locations, places, and settings within a story',
  inputSchema: {
    type: 'object',
    properties: {
      location_name: {
        type: 'string',
        description: 'Name of the location (e.g., "Konoha Village", "Marineford", "Wall Maria")',
      },
      source_name: {
        type: 'string',
        description: 'Name of the story the location is from',
      },
      time_period: {
        type: 'string',
        description: 'Specific time period or arc when describing the location (locations may change over time)',
      },
    },
    required: ['location_name', 'source_name'],
  },
};

export const GET_TIMELINE_EVENTS_TOOL: Tool = {
  name: 'get_timeline_events',
  description: 'Get chronological events from a story arc, season, or specific episode/chapter range',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to get timeline from',
      },
      arc_name: {
        type: 'string',
        description: 'Specific arc or season name',
      },
      episode_range: {
        type: 'string',
        description: 'Episode range (e.g., "1-10", "45-67") for anime',
      },
      chapter_range: {
        type: 'string',
        description: 'Chapter range (e.g., "100-120") for manga',
      },
    },
    required: ['source_name'],
  },
};

export const SET_ADVENTURE_CONTEXT_TOOL: Tool = {
  name: 'set_adventure_context',
  description: 'Set the current context and state for an adventure to maintain story consistency',
  inputSchema: {
    type: 'object',
    properties: {
      adventure_id: {
        type: 'string',
        description: 'Unique identifier for the adventure',
      },
      source_name: {
        type: 'string',
        description: 'Name of the source story being used',
      },
      current_arc: {
        type: 'string',
        description: 'Current story arc the adventure is taking place in',
      },
      active_characters: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'List of characters currently active in the adventure',
      },
      story_state: {
        type: 'object',
        description: 'Current state of story elements (relationships, plot points, etc.)',
      },
    },
    required: ['adventure_id', 'source_name'],
  },
};

export const GET_ADVENTURE_STATE_TOOL: Tool = {
  name: 'get_adventure_state',
  description: 'Get the current state and context of an ongoing adventure',
  inputSchema: {
    type: 'object',
    properties: {
      adventure_id: {
        type: 'string',
        description: 'Unique identifier for the adventure',
      },
    },
    required: ['adventure_id'],
  },
};

export const SEARCH_STORY_CONTENT_TOOL: Tool = {
  name: 'search_story_content',
  description: 'Search for specific content within a story (characters, locations, events, abilities, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to search within',
      },
      query: {
        type: 'string',
        description: 'Search query (character names, abilities, locations, etc.)',
      },
      content_type: {
        type: 'string',
        enum: ['character', 'location', 'ability', 'event', 'item', 'organization', 'all'],
        description: 'Type of content to search for',
      },
    },
    required: ['source_name', 'query'],
  },
};

export const VALIDATE_STORY_ELEMENT_TOOL: Tool = {
  name: 'validate_story_element',
  description: 'Validate if a story element (character, ability, location, etc.) exists in the canonical source',
  inputSchema: {
    type: 'object',
    properties: {
      source_name: {
        type: 'string',
        description: 'Name of the story to validate against',
      },
      element_type: {
        type: 'string',
        enum: ['character', 'ability', 'location', 'item', 'organization', 'event'],
        description: 'Type of element to validate',
      },
      element_name: {
        type: 'string',
        description: 'Name of the element to validate',
      },
      context: {
        type: 'string',
        description: 'Additional context for validation (arc, time period, etc.)',
      },
    },
    required: ['source_name', 'element_type', 'element_name'],
  },
};
