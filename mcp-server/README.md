# Adventure Story MCP Server

A Model Context Protocol (MCP) server that provides canonical story information from various sources (anime, manga, novels, etc.) for the Adventure Roleplay system.

## Features

- **Canonical Story Data**: Fetch accurate information from wikis and databases
- **Character Information**: Get detailed character profiles, abilities, and relationships
- **Location Details**: Retrieve information about places and settings
- **Timeline Events**: Access story progression and important events
- **Adventure Context**: Manage ongoing adventure states and player choices
- **Content Validation**: Verify story elements against canonical sources

## Tools Available

### Story Information
- `get_story_info` - Get comprehensive story/world information
- `get_timeline_events` - Retrieve chronological story events
- `search_story_content` - Search for specific content within stories
- `validate_story_element` - Validate story elements against canonical sources

### Character Management
- `get_character_data` - Get detailed character information
- Character abilities, relationships, and development tracking

### Location Services
- `get_location_data` - Retrieve location details and connections
- Geography, population, and historical information

### Adventure Context
- `set_adventure_context` - Set up adventure state and context
- `get_adventure_state` - Retrieve current adventure information
- Track player choices, character relationships, and plot progression

## Installation

1. Navigate to the MCP server directory:
```bash
cd mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Create environment configuration (optional):
```bash
cp .env.example .env
# Edit .env with your API keys if you want enhanced data sources
```

## Usage

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Integration with MCP Clients

The server communicates via stdio and follows the MCP specification. Add it to your MCP client configuration:

```json
{
  "mcpServers": {
    "adventure-story": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## Supported Sources

The server can fetch information from various story sources:

- **Anime**: One Piece, Naruto, Dragon Ball, Attack on Titan, etc.
- **Manga**: Any series with available wiki information
- **Novels**: Light novels and web novels with community wikis
- **Games**: Video game stories with comprehensive wikis

### Data Sources

1. **Fandom Wikis**: Primary source for detailed story information
2. **MyAnimeList API**: Additional anime/manga data via Jikan API
3. **Local Database**: Cached data and adventure contexts
4. **Wikipedia**: Fallback for general information

## Example Usage

### Getting Story Information
```typescript
// Tool call: get_story_info
{
  "source_name": "One Piece",
  "setting": "Wano Arc",
  "arc": "Wano Country"
}

// Response: Detailed world-building, plot, characters, etc.
```

### Character Data
```typescript
// Tool call: get_character_data
{
  "character_name": "Monkey D. Luffy",
  "source_name": "One Piece",
  "arc_context": "Post-Timeskip"
}

// Response: Abilities, relationships, development, etc.
```

### Adventure Context Management
```typescript
// Tool call: set_adventure_context
{
  "adventure_id": "my-onepiece-adventure",
  "source_name": "One Piece",
  "current_arc": "Wano Arc",
  "active_characters": ["Luffy", "Zoro", "Sanji"],
  "story_state": {
    "current_location": "Onigashima",
    "major_events": ["Raid on Onigashima"],
    "character_relationships": {},
    "plot_points": []
  }
}
```

## Configuration

### Environment Variables

- `JIKAN_API_BASE_URL`: Jikan API endpoint (default: https://api.jikan.moe/v4)
- `CACHE_TTL_SECONDS`: Cache time-to-live (default: 3600)
- `DATABASE_PATH`: SQLite database path (default: ./data/stories.db)
- `API_RATE_LIMIT_PER_MINUTE`: Rate limiting (default: 60)

### Adding New Sources

To add support for new story sources:

1. Add the mapping in `WikiDataFetcher.ts`:
```typescript
private wikiMappings: { [key: string]: string } = {
  'your story name': 'wiki-subdomain',
  // ...
};
```

2. The server will automatically use the new mapping for data fetching.

## Architecture

```
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # MCP tool definitions
│   ├── services/             # Core business logic
│   │   ├── storyDataService.ts
│   │   ├── characterService.ts
│   │   ├── locationService.ts
│   │   └── adventureContextService.ts
│   ├── data-sources/         # External data fetchers
│   │   ├── wikiDataFetcher.ts
│   │   └── animeDataFetcher.ts
│   └── utils/                # Utilities
│       ├── cache.ts
│       └── database.ts
```

## Error Handling

The server includes comprehensive error handling:

- **Rate Limiting**: Automatic retry with backoff for API limits
- **Caching**: Reduces API calls and improves performance
- **Fallbacks**: Multiple data sources for reliability
- **Validation**: Input validation and error messages

## Performance

- **Caching**: In-memory and database caching for frequently accessed data
- **Rate Limiting**: Respects API rate limits to avoid service disruption
- **Batch Operations**: Efficient batch processing where possible
- **Database**: SQLite for persistent storage and adventure state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
1. Check the GitHub issues
2. Review the MCP specification
3. Contact the development team

---

This MCP server provides canonical story information to enhance your adventure roleplay experiences with accurate, authentic content from your favorite stories!
