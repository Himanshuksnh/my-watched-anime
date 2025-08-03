export default function LoadingSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-muted rounded w-3/4" />

        {/* Details */}
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted rounded w-full" />
      </div>
    </div>
  )
}
