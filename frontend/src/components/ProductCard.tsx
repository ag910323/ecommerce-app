import { HiStar, HiHeart } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { memo, useState, type MouseEvent } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useNotification } from "../context/NotificationContext";
import type { ProductResponse } from "../types";

interface ProductCardProps {
  product: ProductResponse | {
    id: number;
    title?: string;
    name?: string;
    price: string | number;
    originalPrice?: string;
    discount?: string;
    discountPercentage?: number;
    rating: number;
    reviews?: number;
    image?: string;
    imageUrls?: string[];
    brandName?: string;
    tag?: string;
  };
  variant?: 'default' | 'sponsored' | 'deals' | 'recommended' | 'explore' | 'trending' | 'mixed';
  onWishlist?: (productId: number | string) => void;
  className?: string;
  imageIndex?: number;
  source?: 'HOME' | 'SHOP' | 'CATEGORY';
}

function ProductCard({ 
  product, 
  variant = 'default', 
  onWishlist,
  className = "",
  imageIndex = 0,
  source
}: ProductCardProps) {
  const { isInWishlist, addToWishlist } = useWishlist();
  const { addNotification } = useNotification();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Normalize product data to handle different product structures
  const productName = product?.name || ('title' in product ? product.title : undefined) || 'Product Name';
  const productPrice = typeof product?.price === 'number' ? `₹${product.price}` :
                      typeof product?.price === 'string' ? product.price : '₹0';
  const productImage = product?.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : ('image' in product ? product.image : undefined) || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
  
  // Safe access to product ID
  const productId = product?.id ? Number(product.id) : 0;
  
  // Get description and truncate if needed
  const productDescription = ('description' in product && product.description) ? 
    (product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description) : 
    null;
  
  // Get stock status
  const stockStatus = ('quantity' in product && typeof product.quantity === 'number') ? 
    (product.quantity > 0 ? 'In Stock' : 'Out of Stock') : 
    'In Stock'; // Default to in stock if quantity not available
  
  // Get rating (default to 4.5 if not provided)
  const productRating = typeof product.rating === 'number' ? product.rating : 4.5;
  
  // Check if product is in wishlist
  const inWishlist = isInWishlist(productId);
  const getVariantConfig = () => {
    switch (variant) {
      case 'sponsored':
        return {
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-black hover:bg-gray-800 text-white border-0',
          tag: { text: 'Sponsored', color: 'bg-yellow-500 text-yellow-900' }
        };
      case 'deals':
        return {
          borderColor: 'border-gray-200',
          buttonColor: 'bg-black hover:bg-gray-800 text-white border-0',
          tag: ('discount' in product && product.discount) ? { text: product.discount, color: 'bg-red-500 text-white' } : null
        };
      case 'recommended':
        return {
          borderColor: 'border-gray-200',
          buttonColor: 'bg-black hover:bg-gray-800 text-white border-0',
          tag: ('tag' in product && product.tag) ? { text: product.tag, color: 'bg-blue-500 text-white' } : null
        };
      case 'mixed':
        return {
          borderColor: 'border-gray-200',
          buttonColor: 'bg-black hover:bg-gray-800 text-white border-0',
          tag: ('tag' in product && product.tag) ? { text: product.tag, color: 'bg-green-500 text-white' } : null
        };
      default:
        return {
          borderColor: 'border-gray-200',
          buttonColor: 'bg-black hover:bg-gray-800 text-white border-0',
          tag: null
        };
    }
  };

  const config = getVariantConfig();

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${productId}`, source ? { state: { source } } : {});
  };

  const handleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await addToWishlist(Number(product.id));
      addNotification({
        type: 'success',
        title: 'Added to wishlist',
        message: `${productName} was added to your wishlist.`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to add to wishlist',
        message: 'An error occurred while adding to wishlist.'
      });
      console.error('Error adding to wishlist:', error);
    }
    if (onWishlist) {
      onWishlist(product.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-lg shadow-sm overflow-hidden border ${config.borderColor} flex flex-col h-full ${className} cursor-pointer`}
    >
      {/* Product Image Container */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={productImage}
          alt="Product Image"
          loading={imageIndex < 8 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover bg-gray-200 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit: 'cover' }}
        />
        
        {/* Primary Tag (Sponsored/Deal/Custom) */}
        {config.tag && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${config.tag.color}`}>
            {config.tag.text}
          </div>
        )}
        
        {/* Discount Badge (for deals) */}
        {variant === 'deals' && 'discount' in product && product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.discount}
          </div>
        )}
        
        {/* Discount Percentage Badge (for sponsored/API products) */}
        {variant === 'sponsored' && product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.discountPercentage}% off
          </div>
        ) : null}
        
        {/* Secondary Tags (for recommended/mixed) */}
        {(variant === 'recommended' || variant === 'mixed') && 'discount' in product && product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.discount}
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-12 right-2 p-2 rounded-full shadow-md bg-white border-0"
          aria-label="Add to wishlist"
        >
          <HiHeart className={`w-5 h-5 ${
            inWishlist ? 'text-red-500 fill-current' : 'text-gray-600'
          }`} />
        </button>
      </div>

      {/* Product Content Container */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm leading-5 line-clamp-2 overflow-hidden break-words h-10">
            {productName}
          </h3>
          {product.brandName && (
            <p className="text-xs text-gray-500 mt-1 font-medium truncate line-clamp-1">by {product.brandName}</p>
          )}
          <p className="text-xs text-gray-600 mt-2 line-clamp-2 overflow-hidden break-words h-10">
            {productDescription}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <HiStar className="w-4 h-4 text-yellow-400" />
            <span>{productRating}</span>
            {'reviews' in product && product.reviews ? (
              <span className="text-gray-500">({product.reviews})</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {variant === 'sponsored' && product.discountPercentage && product.discountPercentage > 0 ? (
              <span className="text-sm text-red-500 font-semibold">{product.discountPercentage}% off</span>
            ) : null}
            <span className={`text-xs font-medium ${stockStatus === 'In Stock' ? 'text-green-600' : 'text-red-600'}`}>
              {stockStatus}
            </span>
          </div>
        </div>

          <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-gray-900">{productPrice}</span>
          {'originalPrice' in product && product.originalPrice && variant !== 'sponsored' ? (
            <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Memoize ProductCard to prevent unnecessary re-renders
// Only re-render if product.id or handlers change
const ProductCardMemo = memo(ProductCard, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.onWishlist === nextProps.onWishlist &&
    prevProps.className === nextProps.className &&
    prevProps.imageIndex === nextProps.imageIndex &&
    prevProps.source === nextProps.source
  );
});

export default ProductCardMemo;
