# Supabase Setup Guide for Adventure Story MCP Server

This guide will help you set up your Supabase database for the Adventure Story MCP Server, migrating from local SQLite to cloud-based Supabase.

## 🎯 Overview

The MCP server now uses Supabase as its primary database instead of local SQLite, providing:
- ✅ **Cloud-based storage** - Your data is stored in the cloud
- ✅ **Better scalability** - Handle more concurrent users and data
- ✅ **Real-time capabilities** - Real-time updates and collaboration
- ✅ **Better security** - Row Level Security (RLS) and authentication
- ✅ **Data persistence** - No data loss when restarting the server

## 📋 Prerequisites

1. **Supabase Account**: You should have a Supabase project set up
2. **Environment Variables**: Your main app should already have these configured:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🚀 Setup Steps

### Step 1: Database Schema Setup

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project: `jhrmlnfdnxjdlrlzokdd`

2. **Run the SQL Schema**
   - Go to the "SQL Editor" in your Supabase dashboard
   - Copy the contents of `src/utils/setupSupabaseSchema.sql`
   - Paste and execute the SQL script

3. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see these new tables:
     - `adventure_contexts` - Stores adventure data and state
     - `adventure_events` - Stores timeline of events
     - `story_cache` - Caches API responses

### Step 2: Environment Configuration

The MCP server will automatically use the same environment variables as your main app:

```bash
VITE_SUPABASE_URL=https://jhrmlnfdnxjdlrlzokdd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test the Connection

1. **Build the MCP Server**:
   ```bash
   cd mcp-server
   npm run build
   ```

2. **Test Connection** (when you start the server):
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### `adventure_contexts`
Stores the main adventure information and state:
```sql
- adventure_id (TEXT, Primary Key)
- source_name (TEXT) - e.g., "One Piece", "Naruto"
- current_arc (TEXT) - Current story arc
- active_characters (JSONB) - List of active characters
- story_state (JSONB) - Complex adventure state object
- ai_context (JSONB) - AI-generated context and suggestions
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `adventure_events`
Stores the timeline of events in each adventure:
```sql
- id (BIGSERIAL, Primary Key)
- adventure_id (TEXT, Foreign Key)
- event_type (TEXT) - 'choice', 'event', 'dialogue', 'system'
- event_content (TEXT) - Description of the event
- characters (JSONB) - Characters involved
- location (TEXT) - Where it happened
- timestamp (TIMESTAMPTZ)
```

### `story_cache`
Caches API responses to reduce external API calls:
```sql
- cache_key (TEXT, Primary Key)
- source_name (TEXT) - Source story name
- cache_data (JSONB) - Cached response data
- created_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
```

## 🔧 Features

### Data Migration Benefits
- **Persistent Storage**: Data survives server restarts
- **Scalability**: Handle multiple concurrent adventures
- **Performance**: Indexed queries for faster access
- **Caching**: Smart caching reduces API calls
- **Real-time**: Real-time updates across clients

### AI Integration
- **Context Enhancement**: AI analyzes and enhances adventure context
- **Canonical Validation**: Validates story elements against sources
- **Narrative Suggestions**: AI provides story suggestions
- **Character Analysis**: Deep character data analysis

### Multi-Source Data
- **AniList API**: Comprehensive anime/manga data
- **Jikan API**: MyAnimeList integration
- **MangaDx API**: Manga-specific data
- **Wiki Data**: Detailed story information

## 🛠️ Troubleshooting

### Connection Issues
1. **Check Environment Variables**:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Verify Supabase Project**:
   - Ensure your project is active in Supabase dashboard
   - Check that API keys haven't expired

3. **Database Permissions**:
   - Verify RLS policies are set up correctly
   - Check that anon user has proper permissions

### Schema Issues
1. **Missing Tables**: Re-run the schema setup SQL
2. **Permission Errors**: Check RLS policies in Supabase
3. **Index Errors**: Verify all indexes were created

### Performance Issues
1. **Slow Queries**: Check if indexes are properly created
2. **Cache Misses**: Verify cache table is working
3. **API Rate Limits**: Check external API rate limiting

## 📈 Usage Examples

### Creating an Adventure
```typescript
await adventureService.setAdventureContext({
  adventure_id: 'one-piece-wano-arc',
  source_name: 'One Piece',
  current_arc: 'Wano Country Arc',
  active_characters: ['Monkey D. Luffy', 'Roronoa Zoro'],
  story_state: {
    current_location: 'Wano Country',
    major_events: ['Arrival at Wano'],
    character_relationships: {},
    plot_points: [],
    player_choices: [],
    world_state: {}
  }
});
```

### Getting Adventure State
```typescript
const state = await adventureService.getAdventureState('one-piece-wano-arc');
console.log(state.context.source_name); // "One Piece"
console.log(state.recent_events); // Array of recent events
console.log(state.ai_context); // AI-enhanced context
```

## 🔄 Migration from SQLite

Your existing SQLite data can be migrated to Supabase:

1. **Export existing data** (if any) from the old SQLite database
2. **Set up Supabase schema** using the provided SQL script
3. **Import data** into Supabase tables
4. **Update environment** to use Supabase configuration
5. **Test functionality** to ensure everything works

## 🎉 Verification

After setup, verify everything is working:

1. ✅ **Tables exist** in Supabase dashboard
2. ✅ **MCP server builds** without errors
3. ✅ **Connection test** passes
4. ✅ **Data operations** work (create, read, update, delete)
5. ✅ **AI features** function properly
6. ✅ **External APIs** integrate correctly

## 🆘 Support

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Review the MCP server console output
3. Verify all environment variables are set correctly
4. Ensure the database schema was created properly

---

**🎮 Your Adventure Story MCP Server is now powered by Supabase!**

The server provides comprehensive story data, AI-enhanced context, and persistent storage for all your adventure roleplay needs.
