import { HiTrash, HiShoppingCart } from 'react-icons/hi';
import type { WishlistItemResponse } from '../api/wishlistApi';

interface WishlistCardProps {
  item: WishlistItemResponse;
  onRemove: (productId: number) => void;
}

export default function WishlistCard({ item, onRemove }: WishlistCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02]">
      {/* Image Section */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gray-100">
        <div className="aspect-square w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <span className="text-sm text-gray-400">Product Image</span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.productId)}
          className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-md opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 hover:bg-red-50 active:scale-95"
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
        >
          <HiTrash className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4">
        {/* Product Info */}
        <div className="flex-1">
          {/* Title */}
          <div className="h-10 mb-3">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 tracking-tight">
              {item.name}
            </h3>
          </div>

          {/* Brand */}
          <div className="h-5 mb-3">
            {item.brandName && (
              <p className="text-xs text-gray-500 line-clamp-1 font-medium">
                {item.brandName}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="h-7 mb-2">
            {item.price && (
              <p className="text-lg font-bold text-gray-900">
                ${item.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Date Added */}
          <div className="h-4">
            <p className="text-xs text-gray-400 line-clamp-1">
              Added {new Date(item.addedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 ease-out flex items-center justify-center text-sm font-semibold gap-2 shadow-sm hover:shadow-md">
          <HiShoppingCart className="w-4 h-4 flex-shrink-0" />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
