import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <div className="max-w-[1448px] mx-auto px-8 py-8">
      {/* Edit button skeleton */}
      <div className="mb-6 flex justify-end">
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8">
          {/* Main image skeleton */}
          <Skeleton className="w-full h-[400px] rounded-lg mb-4" />

          {/* Thumbnails skeleton */}
          <div className="flex gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-24 h-24 rounded-lg" />
            ))}
          </div>

          {/* View buttons skeleton */}
          <div className="flex gap-2 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-28 h-10 rounded-lg" />
            ))}
          </div>

          {/* Info card skeleton */}
          <Skeleton className="w-full h-[300px] rounded-lg mb-6" />

          {/* Yield card skeleton */}
          <Skeleton className="w-full h-[200px] rounded-lg mb-6" />

          {/* Complex amenities skeleton */}
          <div className="mt-12">
            <Skeleton className="w-48 h-8 rounded mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-24 h-6 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure skeleton */}
          <div className="mt-12">
            <Skeleton className="w-full h-[400px] rounded-lg" />
          </div>

          {/* Project details skeleton */}
          <div className="mt-12">
            <Skeleton className="w-48 h-8 rounded mb-6" />
            <Skeleton className="w-full h-[200px] rounded-lg" />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4">
          <div className="space-y-4">
            {/* Viewing request skeleton */}
            <Skeleton className="w-full h-[300px] rounded-lg" />

            {/* Quick actions skeleton */}
            <div className="flex justify-between">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
