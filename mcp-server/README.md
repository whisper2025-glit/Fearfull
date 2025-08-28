# Adventure Story MCP Server

A Model Context Protocol (MCP) server that provides canonical story information from multiple APIs including **AniList**, **Jikan (MyAnimeList)**, and **MangaDex** for the Adventure Roleplay system.

## Features

- **Canonical Story Data**: Fetch accurate information from wikis and databases
- **Character Information**: Get detailed character profiles, abilities, and relationships
- **Location Details**: Retrieve information about places and settings
- **Timeline Events**: Access story progression and important events
- **Adventure Context**: Manage ongoing adventure states and player choices
- **Content Validation**: Verify story elements against canonical sources

## Tools Available

### Story Information
- `get_story_info` - Get comprehensive story/world information from all APIs
- `get_timeline_events` - Retrieve chronological story events
- `search_story_content` - Search across AniList, Jikan, and MangaDx databases
- `validate_story_element` - Validate story elements against canonical sources
- `validate_canon` - Cross-reference canonical accuracy across adaptations

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

### Manga-Specific Features
- `get_manga_info` - Detailed manga information from MangaDx and AniList
- `get_manga_chapters` - Chapter lists and reading information
- `compare_adaptations` - Compare anime vs manga differences
- `get_popular_content` - Trending anime and manga content

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

## Supported Sources & APIs

The server integrates with multiple APIs for comprehensive coverage:

### **AniList API**
- Comprehensive anime and manga database
- Character information with detailed profiles
- Trending and popular content discovery
- High-quality metadata and descriptions

### **Jikan API (MyAnimeList)**
- Extensive anime database with episode information
- Character details and voice actor information
- User ratings and popularity metrics
- Seasonal anime tracking

### **MangaDx API**
- Large manga collection with chapter information
- Multiple language support
- Author and artist details
- Publication and reading status

### **Fandom Wikis**
- Detailed story information and world-building
- Character relationships and development
- Timeline events and plot progression
- Location and organization details

### Multi-API Data Aggregation

1. **AniList API**: Primary source for anime/manga metadata and character info
2. **Jikan API**: Secondary anime data with user statistics and seasonal trends
3. **MangaDx API**: Manga-specific data with chapter information and reading status
4. **Fandom Wikis**: Detailed story information and world-building
5. **Local Database**: Cached data and adventure contexts
6. **Smart Aggregation**: Combines data from all sources for comprehensive results

## Example Usage

### Getting Comprehensive Story Information
```typescript
// Tool call: get_story_info
{
  "source_name": "One Piece",
  "setting": "Wano Arc",
  "arc": "Wano Country"
}

// Response: Combined data from AniList, Jikan, MangaDx, and Wikis
{
  "name": "One Piece",
  "type": "anime",
  "description": "Aggregated from multiple sources",
  "mainCharacters": ["Luffy", "Zoro", "Nami", ...],
  "sources": {
    "anilist": { /* AniList data */ },
    "jikan": { /* Jikan data */ },
    "mangadx": { /* MangaDx data */ }
  }
}
```

### Enhanced Character Data
```typescript
// Tool call: get_character_data
{
  "character_name": "Monkey D. Luffy",
  "source_name": "One Piece",
  "arc_context": "Post-Timeskip"
}

// Response: Multi-source character information
{
  "name": "Monkey D. Luffy",
  "aliases": ["Straw Hat Luffy", "ルフィ"],
  "abilities": {
    "powers": ["Gomu Gomu no Mi", "Haki"],
    "specialAbilities": ["Gear Fourth", "Conqueror's Haki"]
  },
  "images": ["anilist_image_url", "jikan_image_url"],
  "sources": {
    "anilist": { /* Character data from AniList */ },
    "jikan": { /* Character data from Jikan */ }
  }
}
```

### Manga-Specific Features
```typescript
// Tool call: get_manga_info
{
  "manga_name": "One Piece",
  "include_chapters": true,
  "language": "en"
}

// Tool call: compare_adaptations
{
  "source_name": "Attack on Titan",
  "focus_area": "differences"
}

// Response: Detailed comparison between anime and manga
{
  "has_anime": true,
  "has_manga": true,
  "comparison": {
    "differences": {
      "genre_differences": { /* Differences in tags/genres */ },
      "format_differences": {
        "anime_format": "TV",
        "manga_format": "Manga"
      }
    }
  }
}
```

## Configuration

### Environment Variables

**API Configuration:**
- `ANILIST_API_URL`: AniList GraphQL endpoint (default: https://graphql.anilist.co)
- `JIKAN_API_BASE_URL`: Jikan API endpoint (default: https://api.jikan.moe/v4)
- `MANGADEX_API_URL`: MangaDx API endpoint (default: https://api.mangadx.org)

**Rate Limiting:**
- `ANILIST_RATE_LIMIT_DELAY`: AniList request delay (default: 1000ms)
- `JIKAN_RATE_LIMIT_DELAY`: Jikan request delay (default: 1000ms)
- `MANGADEX_RATE_LIMIT_DELAY`: MangaDx request delay (default: 200ms)

**Caching:**
- `CACHE_TTL_SECONDS`: Cache time-to-live (default: 3600)
- `DATABASE_PATH`: SQLite database path (default: ./data/stories.db)
- `API_RATE_LIMIT_PER_MINUTE`: Overall rate limiting (default: 60)

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

This enhanced MCP server provides comprehensive, multi-source canonical information from **AniList**, **Jikan**, and **MangaDx** APIs to deliver the most accurate and complete story data for your adventure roleplay experiences!
