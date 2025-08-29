import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";

export type SortOption = "Hot" | "New" | "Top Chats" | "Top Rated";

interface HomeFiltersProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const ALL_TAGS = [
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

export function HomeFilters({ activeTag, onTagChange, sortBy, onSortChange }: HomeFiltersProps) {
  const visibleTags = useMemo(() => ALL_TAGS, []);

  return (
    <div className="w-full space-y-3">
      {/* Row: sticky sort cube + scrollable tags beneath */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1">
          {/* Sticky cube sort button */}
          <div className="sticky left-0 z-20 -ml-1 pr-2 bg-background">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-8 w-8 aspect-square p-0 rounded-lg border border-border/60 bg-secondary/80 text-[12px] font-medium"
                  aria-label="Sort"
                  title={sortBy}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {["Hot","New","Top Chats","Top Rated"].map((o) => (
                  <DropdownMenuItem key={o} onClick={() => onSortChange(o as SortOption)} className="text-[12px]">
                    {o}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tag chips (will slide under the sticky cube) */}
          {visibleTags.map((t) => (
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

          {/* All tags popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="ml-1 h-8 w-8 aspect-square p-0 rounded-lg">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px]">
              <div className="grid grid-cols-2 gap-2">
                {ALL_TAGS.map((t) => (
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
              <div className="mt-3 flex items-center text-xs text-muted-foreground">
                More
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
