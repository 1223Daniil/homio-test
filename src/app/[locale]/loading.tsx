export default function Loading() {
  return (
    <div className="min-h-screen bg-default-50">
      {/* Hero Section Skeleton */}
      <div className="relative h-[600px] bg-default-100 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-default-200/50 to-default-200/50" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <div className="h-12 w-2/3 max-w-xl bg-default-200 rounded mb-4" />
          <div className="h-6 w-1/2 max-w-md bg-default-200 rounded mb-8" />
          <div className="h-[200px] max-w-3xl bg-default-200 rounded" />
        </div>
      </div>

      {/* Content Sections Skeletons */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Blog Posts Skeleton */}
        <div className="py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-default-200 rounded mb-2" />
              <div className="h-4 w-64 bg-default-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-default-200 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-default-200 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Events Skeleton */}
        <div className="py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-default-200 rounded mb-2" />
              <div className="h-4 w-64 bg-default-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-default-200 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-default-200 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Areas Skeleton */}
        <div className="py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-default-200 rounded mb-2" />
              <div className="h-4 w-64 bg-default-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-default-200 rounded" />
          </div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-default-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-default-200 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Skeleton */}
      <div className="bg-primary-900/10 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="h-10 w-2/3 bg-default-200 rounded mx-auto mb-4" />
          <div className="h-6 w-1/2 bg-default-200 rounded mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <div className="h-12 w-32 bg-default-200 rounded" />
            <div className="h-12 w-32 bg-default-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
} 