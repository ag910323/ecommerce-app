import { HiHeart, HiPlus } from 'react-icons/hi';

interface EmptyWishlistProps {
  wishlistName: string;
  onBrowseClick: () => void;
  onCreateWishlist: () => void;
}

export default function EmptyWishlist({
  wishlistName,
  onBrowseClick,
  onCreateWishlist
}: EmptyWishlistProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 sm:p-12 lg:p-16 shadow-sm border border-gray-100 animate-in fade-in duration-300">
      {/* Icon */}
      <div className="mb-6 inline-flex p-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <HiHeart className="w-16 h-16 text-blue-400" />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
        No items in {wishlistName}
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
        Start adding products to see them here. Discover amazing deals and save your favorites for later.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Primary CTA */}
        <button
          type="button"
          onClick={onBrowseClick}
          className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Browse Products
        </button>

        {/* Secondary CTA */}
        <button
          type="button"
          onClick={onCreateWishlist}
          className="flex-1 sm:flex-none px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Create New Wishlist
        </button>
      </div>

      {/* Optional: Recommended Products Hint */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need inspiration? Check out our{' '}
          <button
            onClick={onBrowseClick}
            className="text-blue-600 hover:text-blue-700 font-medium underline focus:outline-none"
          >
            recommended products
          </button>
        </p>
      </div>
    </div>
  );
}