import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CharacterCard } from "@/components/CharacterCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  X,
  Search as SearchIcon,
  Trash2,
  ChevronDown,
  Flame,
  MessageCircle,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'Characters'>('Characters');
  const [activeRankTab, setActiveRankTab] = useState<'Creators' | 'Characters'>('Creators');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Recommend');
  const [filterTags, setFilterTags] = useState('All Tags');
  const [filterGender, setFilterGender] = useState('Gender All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagsSheetOpen, setIsTagsSheetOpen] = useState(false);

  const sortOptions = ['Recommend', 'Popular', 'Latest'];
  const genderOptions = ['Gender All', 'Male', 'Female', 'Non-binary', 'Other'];
  const availableTags = [
    'NSFW', 'Romance', 'Adventure', 'Fantasy', 'Sci-Fi', 'Horror', 'Comedy',
    'Drama', 'Action', 'Mystery', 'Thriller', 'Historical', 'Contemporary',
    'Supernatural', 'Slice of Life', 'Educational', 'Family Friendly',
    'Dark', 'Wholesome', 'Mature', 'Teen', 'Adult'
  ];

  const [trendingCreators, setTrendingCreators] = useState<any[]>([]);
  const [trendingCharacters, setTrendingCharacters] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);


  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  // Load trending data on component mount
  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      // Load trending creators
      const { data: creators, error: creatorsError } = await supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(10);

      if (creatorsError) {
        console.error('Error loading trending creators:', creatorsError);
      } else {
        setTrendingCreators(creators || []);
      }

      // Load trending characters
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .order('message_count', { ascending: false })
        .limit(10);

      if (charactersError) {
        console.error('Error loading trending characters:', charactersError);
      } else {
        setTrendingCharacters(characters || []);
      }

      // Load popular searches
      const { data: searches, error: searchesError } = await supabase
        .from('search_terms')
        .select('term')
        .order('search_count', { ascending: false })
        .limit(10);

      if (searchesError) {
        console.error('Error loading popular searches:', searchesError);
      } else {
        setPopularSearches(searches?.map(s => s.term) || []);
      }
    } catch (error) {
      console.error('Error loading trending data:', error);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 5);
    });

    try {
      // Search characters in Supabase
      const { data: characters, error } = await supabase
        .from('characters')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('message_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
        setSearchResults([]);
      } else {
        setSearchResults(characters || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false);
  };

  const removeRecentSearch = (searchTerm: string) => {
    setRecentSearches(prev => prev.filter(search => search !== searchTerm));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    setSearchParams({ q: term });
    performSearch(term);
  };

  const isSearchActive = hasSearched && searchQuery.trim().length > 0;

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-4 space-y-4">
          {/* Search Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search character name or key word"
                  className="pl-10 pr-10 bg-muted border-0 rounded-full text-xs"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {!isSearchActive ? (
            <>
              {/* Recent Search */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-primary">Recent Search</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearAllRecentSearches}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="cursor-pointer bg-muted text-muted-foreground text-xs hover:bg-muted/80"
                          onClick={() => handlePopularSearchClick(search)}
                        >
                          {search}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecentSearch(search)}
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Search */}
              {popularSearches.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-primary">Popular Search</h2>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer bg-muted text-muted-foreground text-xs hover:bg-muted/80"
                        onClick={() => handlePopularSearchClick(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Rank */}
              {(trendingCreators.length > 0 || trendingCharacters.length > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-primary">Trending Rank</h2>
                    <div className="flex bg-muted rounded-full p-1">
                      <Button
                        variant={activeRankTab === 'Creators' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveRankTab('Creators')}
                        className="text-xs rounded-full px-6 h-8"
                        disabled={trendingCreators.length === 0}
                      >
                        Creators
                      </Button>
                      <Button
                        variant={activeRankTab === 'Characters' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveRankTab('Characters')}
                        className="text-xs rounded-full px-6 h-8"
                        disabled={trendingCharacters.length === 0}
                      >
                        Characters
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeRankTab === 'Creators' ? (
                      trendingCreators.length > 0 ? (
                        // Creators list
                        trendingCreators.map((creator) => (
                          <div key={creator.id} className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm">
                                  {creator.username?.charAt(0) || creator.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="text-sm font-semibold text-white">{creator.username || creator.email}</h3>
                            </div>

                            <div className="flex justify-between text-center">
                              <div>
                                <div className="text-lg font-bold text-green-400">{creator.characters_count || 0}</div>
                                <div className="text-xs text-green-400">Characters</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-400">{creator.messages_count || 0}</div>
                                <div className="text-xs text-green-400">Messages</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-400">{creator.followers_count || 0}</div>
                                <div className="text-xs text-green-400">Followers</div>
                              </div>
                            </div>

                            {creator.bio && (
                              <p className="text-xs text-gray-300">{creator.bio}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No trending creators found</p>
                        </div>
                      )
                    ) : (
                      trendingCharacters.length > 0 ? (
                        // Characters list
                        trendingCharacters.map((character, index) => (
                          <div key={character.id} className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                            <span className="text-lg font-bold text-white min-w-[20px]">{index + 1}</span>
                            <img
                              src={character.image_url || '/placeholder.svg'}
                              alt={character.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-white truncate">{character.name}</h3>
                              <p className="text-xs text-gray-300 line-clamp-1">{character.description}</p>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <MessageCircle className="h-3 w-3" />
                              <span className="text-xs font-semibold">{character.message_count || 0}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No trending characters found</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Search Results */}
              <div className="space-y-4">

                {/* Filter Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Sort Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-green-500 text-green-400 hover:bg-green-500/10"
                          >
                            {sortBy} <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border-border">
                          {sortOptions.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => setSortBy(option)}
                              className={`text-xs cursor-pointer ${
                                sortBy === option ? 'bg-green-500/20 text-green-400' : 'text-foreground'
                              }`}
                            >
                              {option}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Tags Sheet */}
                      <Sheet open={isTagsSheetOpen} onOpenChange={setIsTagsSheetOpen}>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-green-500 text-green-400 hover:bg-green-500/10"
                          >
                            {selectedTags.length > 0 ? `${selectedTags.length} Tags` : filterTags}
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                          <SheetHeader>
                            <SheetTitle className="text-sm">Select Tags</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {availableTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                                  className={`cursor-pointer text-xs ${
                                    selectedTags.includes(tag)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}
                                  onClick={() => {
                                    setSelectedTags(prev =>
                                      prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                    );
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setFilterTags(selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'All Tags');
                                  setIsTagsSheetOpen(false);
                                }}
                                className="text-xs"
                              >
                                Apply ({selectedTags.length})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTags([]);
                                  setFilterTags('All Tags');
                                }}
                                className="text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      {/* Gender Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {filterGender} <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border-border">
                          {genderOptions.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => setFilterGender(option)}
                              className={`text-xs cursor-pointer ${
                                filterGender === option ? 'bg-accent text-accent-foreground' : 'text-foreground'
                              }`}
                            >
                              {option}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>


                    {/* Character Results Grid */}
                    {isSearching ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {searchResults.map((character) => (
                        <div key={character.id} className="bg-card rounded-xl overflow-hidden">
                          <div className="relative aspect-[4/5]">
                            <img
                              src={character.image}
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Stats overlay */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-1 text-white text-xs">
                                  <MessageCircle className="h-3 w-3" />
                                  {character.stats.messages}
                                </div>
                                {character.stats.likes > 0 && (
                                  <div className="flex items-center gap-1 text-white text-xs">
                                    ❤️ {character.stats.likes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="text-sm font-semibold text-white mb-1">{character.name}</h3>
                            {character.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {character.description}
                              </p>
                            )}
                            
                            {/* Tags */}
                            {character.tags && character.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {character.tags.map((tag: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-2 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Creator info */}
                            {character.creator && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{character.creator}</span>
                                {character.rating && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs">⭐</span>
                                    <span className="text-xs">{character.rating}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No characters found for "{searchQuery}"</p>
                        <p className="text-xs mt-2">Try different keywords or browse trending characters above.</p>
                      </div>
                    )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
