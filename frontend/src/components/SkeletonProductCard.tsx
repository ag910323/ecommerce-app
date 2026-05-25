/**
 * SkeletonProductCard
 * Placeholder component for loading state
 * Matches ProductCard dimensions for consistent layout
 */
export default function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-300" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
        
        {/* Rating & Discount Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-300 rounded w-16" />
          <div className="h-3 bg-gray-300 rounded w-12" />
        </div>
        
        {/* Price Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 rounded w-20" />
          <div className="h-3 bg-gray-300 rounded w-24" />
        </div>
        
        {/* Button Skeleton */}
        <div className="h-10 bg-gray-300 rounded mt-4" />
      </div>
    </div>
  );
}
