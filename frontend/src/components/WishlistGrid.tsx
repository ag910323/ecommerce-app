import WishlistCard from './WishlistCard';
import type { WishlistItemResponse } from '../api/wishlistApi';

interface WishlistGridProps {
  items: WishlistItemResponse[];
  onRemoveItem: (productId: number) => void;
}

export default function WishlistGrid({ items, onRemoveItem }: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {items.map((item) => (
        <WishlistCard
          key={item.productId}
          item={item}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
}
