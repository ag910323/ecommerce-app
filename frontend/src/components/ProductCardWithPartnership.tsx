import { HiStar, HiHeart, HiShoppingCart, HiEye, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';

export interface ProductWithPartnership {
  id: number;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviews: number;
  image: string;
  
  // Sponsorship fields
  isSponsored?: boolean;
  sponsorPriority?: number;
  
  // Brand Partnership fields
  partnershipBadge?: string;
  partnershipLevel?: 'NONE' | 'PARTNER' | 'FEATURED' | 'TOP' | 'EXCLUSIVE';
  partnershipPriority?: number;
  
  // Additional badges
  badge?: string;
  badgeColor?: string;
  trending?: string;
}

interface ProductCardWithPartnershipProps {
  product: ProductWithPartnership;
  showProgress?: boolean;
  sold?: number;
  total?: number;
}

export default function ProductCardWithPartnership({ 
  product, 
  showProgress = false, 
  sold, 
  total 
}: ProductCardWithPartnershipProps) {
  
  const getDisplayBadge = () => {
    if (product.partnershipBadge) {
      return {
        text: product.partnershipBadge,
        color: getPartnershipBadgeColor(product.partnershipLevel),
        icon: getPartnershipIcon(product.partnershipLevel)
      };
    } else if (product.isSponsored) {
      return {
        text: "Sponsored",
        color: "bg-orange-500",
        icon: <HiLightningBolt className="w-3 h-3" />
      };
    } else if (product.badge) {
      return {
        text: product.badge,
        color: product.badgeColor || "bg-gray-500",
        icon: null
      };
    }
    return null;
  };

  const getPartnershipBadgeColor = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return 'bg-red-500';
      case 'TOP': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'FEATURED': return 'bg-purple-500';
      case 'PARTNER': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPartnershipIcon = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return <HiStar className="w-3 h-3" />;
      case 'TOP': return <HiLightningBolt className="w-3 h-3" />;
      case 'FEATURED': return <HiShieldCheck className="w-3 h-3" />;
      case 'PARTNER': return <HiHeart className="w-3 h-3" />;
      default: return null;
    }
  };

  const displayBadge = getDisplayBadge();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Main Badge (Partnership/Sponsored/Custom) */}
        {displayBadge && (
          <div className={`absolute top-2 left-2 ${displayBadge.color} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-md`}>
            {displayBadge.icon}
            <span>{displayBadge.text}</span>
          </div>
        )}
        
        {/* Trending Badge */}
        {product.trending && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {product.trending}
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount && (
          <div className={`absolute ${displayBadge ? 'top-10' : 'top-2'} right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold`}>
            {product.discount}
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-12 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
          <HiHeart className="w-4 h-4" />
        </button>
        
        {/* Quick View Button */}
        <button className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-500 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
          <HiEye className="w-4 h-4" />
        </button>

        {/* Partnership Level Indicator */}
        {product.partnershipLevel && product.partnershipLevel !== 'NONE' && (
          <div className="absolute bottom-2 left-2 bg-white/90 text-gray-700 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {getPartnershipIcon(product.partnershipLevel)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 h-12 overflow-hidden group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500 ml-2">({product.reviews.toLocaleString()})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900">{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{product.originalPrice}</span>
            )}
          </div>
        </div>
        
        {/* Progress Bar for Flash Sale */}
        {showProgress && sold && total && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Sold: {sold}</span>
              <span>Available: {total - sold}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sold / total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Partnership Benefits */}
        {product.partnershipLevel && product.partnershipLevel !== 'NONE' && (
          <div className="mb-3 text-xs text-gray-600 flex items-center space-x-2">
            {getPartnershipIcon(product.partnershipLevel)}
            <span>
              {product.partnershipLevel === 'EXCLUSIVE' && 'Exclusive benefits'}
              {product.partnershipLevel === 'TOP' && 'Priority support'}
              {product.partnershipLevel === 'FEATURED' && 'Fast delivery'}
              {product.partnershipLevel === 'PARTNER' && 'Verified quality'}
            </span>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
          <HiShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
