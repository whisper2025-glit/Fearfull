#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { StoryDataService } from './services/storyDataService.js';
import { CharacterService } from './services/characterService.js';
import { LocationService } from './services/locationService.js';
import { AdventureContextService } from './services/adventureContextService.js';
import { 
  GET_STORY_INFO_TOOL,
  GET_CHARACTER_DATA_TOOL, 
  GET_LOCATION_DATA_TOOL,
  GET_TIMELINE_EVENTS_TOOL,
  SET_ADVENTURE_CONTEXT_TOOL,
  GET_ADVENTURE_STATE_TOOL,
  SEARCH_STORY_CONTENT_TOOL,
  VALIDATE_STORY_ELEMENT_TOOL
} from './tools/index.js';

class AdventureStoryMCPServer {
  private server: Server;
  private storyService: StoryDataService;
  private characterService: CharacterService;
  private locationService: LocationService;
  private contextService: AdventureContextService;

  constructor() {
    this.server = new Server(
      {
        name: 'adventure-story-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.storyService = new StoryDataService();
    this.characterService = new CharacterService();
    this.locationService = new LocationService();
    this.contextService = new AdventureContextService();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          GET_STORY_INFO_TOOL,
          GET_CHARACTER_DATA_TOOL,
          GET_LOCATION_DATA_TOOL,
          GET_TIMELINE_EVENTS_TOOL,
          SET_ADVENTURE_CONTEXT_TOOL,
          GET_ADVENTURE_STATE_TOOL,
          SEARCH_STORY_CONTENT_TOOL,
          VALIDATE_STORY_ELEMENT_TOOL,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_story_info':
            return await this.handleGetStoryInfo(args);

          case 'get_character_data':
            return await this.handleGetCharacterData(args);

          case 'get_location_data':
            return await this.handleGetLocationData(args);

          case 'get_timeline_events':
            return await this.handleGetTimelineEvents(args);

          case 'set_adventure_context':
            return await this.handleSetAdventureContext(args);

          case 'get_adventure_state':
            return await this.handleGetAdventureState(args);

          case 'search_story_content':
            return await this.handleSearchStoryContent(args);

          case 'validate_story_element':
            return await this.handleValidateStoryElement(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${errorMessage}`
        );
      }
    });
  }

  private async handleGetStoryInfo(args: any) {
    const { source_name, setting, arc } = args;
    
    if (!source_name) {
      throw new McpError(ErrorCode.InvalidParams, 'source_name is required');
    }

    const storyInfo = await this.storyService.getStoryInfo(source_name, setting, arc);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(storyInfo, null, 2),
        },
      ],
    };
  }

  private async handleGetCharacterData(args: any) {
    const { character_name, source_name, arc_context } = args;
    
    if (!character_name || !source_name) {
      throw new McpError(ErrorCode.InvalidParams, 'character_name and source_name are required');
    }

    const characterData = await this.characterService.getCharacterData(
      character_name, 
      source_name, 
      arc_context
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(characterData, null, 2),
        },
      ],
    };
  }

  private async handleGetLocationData(args: any) {
    const { location_name, source_name, time_period } = args;
    
    if (!location_name || !source_name) {
      throw new McpError(ErrorCode.InvalidParams, 'location_name and source_name are required');
    }

    const locationData = await this.locationService.getLocationData(
      location_name, 
      source_name, 
      time_period
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(locationData, null, 2),
        },
      ],
    };
  }

  private async handleGetTimelineEvents(args: any) {
    const { source_name, arc_name, episode_range, chapter_range } = args;
    
    if (!source_name) {
      throw new McpError(ErrorCode.InvalidParams, 'source_name is required');
    }

    const timelineEvents = await this.storyService.getTimelineEvents(
      source_name, 
      arc_name, 
      episode_range, 
      chapter_range
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(timelineEvents, null, 2),
        },
      ],
    };
  }

  private async handleSetAdventureContext(args: any) {
    const { adventure_id, source_name, current_arc, active_characters, story_state } = args;
    
    if (!adventure_id || !source_name) {
      throw new McpError(ErrorCode.InvalidParams, 'adventure_id and source_name are required');
    }

    await this.contextService.setAdventureContext({
      adventure_id,
      source_name,
      current_arc,
      active_characters: active_characters || [],
      story_state: story_state || {}
    });
    
    return {
      content: [
        {
          type: 'text',
          text: 'Adventure context set successfully',
        },
      ],
    };
  }

  private async handleGetAdventureState(args: any) {
    const { adventure_id } = args;
    
    if (!adventure_id) {
      throw new McpError(ErrorCode.InvalidParams, 'adventure_id is required');
    }

    const adventureState = await this.contextService.getAdventureState(adventure_id);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(adventureState, null, 2),
        },
      ],
    };
  }

  private async handleSearchStoryContent(args: any) {
    const { source_name, query, content_type } = args;
    
    if (!source_name || !query) {
      throw new McpError(ErrorCode.InvalidParams, 'source_name and query are required');
    }

    const searchResults = await this.storyService.searchStoryContent(
      source_name, 
      query, 
      content_type
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(searchResults, null, 2),
        },
      ],
    };
  }

  private async handleValidateStoryElement(args: any) {
    const { source_name, element_type, element_name, context } = args;
    
    if (!source_name || !element_type || !element_name) {
      throw new McpError(ErrorCode.InvalidParams, 'source_name, element_type, and element_name are required');
    }

    const validation = await this.storyService.validateStoryElement(
      source_name, 
      element_type, 
      element_name, 
      context
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validation, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Adventure Story MCP Server running on stdio');
  }
}

const server = new AdventureStoryMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
