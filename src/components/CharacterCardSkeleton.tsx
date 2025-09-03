import { Skeleton } from "@/components/ui/skeleton";

export function CharacterCardSkeleton() {
  return (
    <div className="character-card group w-full">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3 mb-2" />
          
          {/* Stats */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 rounded-full" />
            <Skeleton className="h-4 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
