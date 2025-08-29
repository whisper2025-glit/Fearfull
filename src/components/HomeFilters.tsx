import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export type SortOption =
  | "Popular"
  | "Recent Hits"
  | "Trending"
  | "New"
  | "Daily Ranking"
  | "Editor Choice"
  | "Following";

interface HomeFiltersProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  gender: string;
  onGenderChange: (gender: string) => void;
}

const TAGS = [
  "For You",
  "Anime",
  "Romance",
  "OC",
  "RPG",
  "Furry",
  "Game Characters",
  "BL & ABO",
  "Movie & TV",
  "Helpers",
  "VTuber",
  "Cartoon",
  "Interactive story",
  "Ai-Roleplay",
];

const SORT_OPTIONS: SortOption[] = [
  "Popular",
  "Recent Hits",
  "Trending",
  "New",
  "Daily Ranking",
  "Editor Choice",
  "Following",
];

const GENDER_OPTIONS = ["Gender All", "Male", "Female", "Non-binary"] as const;

export function HomeFilters({ activeTag, onTagChange, sortBy, onSortChange, gender, onGenderChange }: HomeFiltersProps) {
  return (
    <div className="w-full space-y-3">
      {/* Top controls row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-8 rounded-full px-3 text-[12px] font-medium border border-border/60">
              {sortBy}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuItem key={o} onClick={() => onSortChange(o)} className="text-[12px] cursor-pointer">
                {o}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* All Tags popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" className="h-8 rounded-full px-3 text-[12px] font-medium border border-primary/60">
              All Tags
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px]">
            <div className="grid grid-cols-2 gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => onTagChange(t)}
                  className={clsx(
                    "h-8 rounded-full border border-border/60 bg-secondary/70 px-3 text-[12px] font-medium text-left truncate",
                    activeTag === t ? "bg-primary text-primary-foreground border-primary/60" : "hover:bg-secondary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Gender dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-8 rounded-full px-3 text-[12px] font-medium border border-border/60">
              {gender}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            {GENDER_OPTIONS.map((g) => (
              <DropdownMenuItem key={g} onClick={() => onGenderChange(g)} className="text-[12px] cursor-pointer">
                {g}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tag chips row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => onTagChange(t)}
            className={clsx(
              "h-8 rounded-full border border-border/60 bg-secondary/70 px-3 text-[12px] font-medium whitespace-nowrap transition-colors",
              activeTag === t ? "bg-primary text-primary-foreground border-primary/60" : "hover:bg-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
