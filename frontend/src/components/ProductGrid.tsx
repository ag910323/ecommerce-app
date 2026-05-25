import { memo, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import type { ProductResponse } from "../types";

interface ProductGridProps {
  products: (ProductResponse | {
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
  })[];
  variant?: 'default' | 'sponsored' | 'deals' | 'recommended' | 'trending' | 'mixed';
  loading?: boolean;
  emptyMessage?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  layout?: 'responsive' | 'fixed';
  source?: 'HOME' | 'SHOP' | 'CATEGORY';
}

function ProductGrid({
  products,
  variant = 'default',
  loading = false,
  emptyMessage,
  className = "",
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  layout = 'responsive',
  source
}: ProductGridProps) {
  // Delayed loading state to prevent flicker on fast requests
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  useEffect(() => {
    if (loading) {
      // Show overlay after 150ms delay to prevent flicker on fast requests
      const timer = setTimeout(() => setShowLoadingOverlay(true), 150);
      return () => clearTimeout(timer);
    } else {
      // Immediately hide overlay when not loading
      setShowLoadingOverlay(false);
    }
  }, [loading]);

  // Generate flex classes: responsive grid or fixed-width carousel-like layout
  const flexClasses = layout === 'fixed' 
    ? `flex flex-wrap gap-4`
    : `flex flex-wrap gap-4`;

  // STRICT LOADING STATE CONTRACT - NO BLANK SCREENS ALLOWED
  // Debug logging to catch blank screen states
  console.log('ProductGrid state:', { loading, productCount: products?.length || 0 });

  // PRIORITY 1: Loading + No Products → IMMEDIATE SKELETONS (no delay)
  if (loading && (!products || products.length === 0)) {
    const skeletonCount = columns.desktop;
    const borderColor = variant === 'sponsored' ? 'border-yellow-200' : 'border-gray-200';
    
    return (
      <div className={`relative ${flexClasses} ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={`skeleton-${index}`} className={`bg-white rounded-lg shadow-md overflow-hidden border ${borderColor} ${
            layout === 'fixed' ? 'flex-shrink-0 w-72' : 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5'
          }`}>
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // PRIORITY 2: Loading + Has Products → PRODUCTS WITH OVERLAY
  if (loading && products && products.length > 0) {
    return (
      <div className={`relative ${flexClasses} ${className}`}>
        {products.filter(product => product && product.id).map((product, index) => {
          try {
            return (
              <div
                key={product.id}
                className={`${layout === 'fixed' ? 'flex-shrink-0 w-72' : 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5'} ${
                  loading ? 'opacity-70 transition-opacity duration-200' : ''
                }`}
              >
                <ProductCard
                  product={product}
                  variant={variant}
                  imageIndex={index}
                  source={source}
                />
              </div>
            );
          } catch (error) {
            console.error('Error rendering product card:', error, product);
            return null;
          }
        })}

        {/* Loading overlay - delayed to prevent flicker */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg pointer-events-none">
            <div className="flex items-center space-x-3 bg-white px-4 py-3 rounded-lg shadow-lg border">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              <span className="text-sm text-gray-600 font-medium">Updating results...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PRIORITY 3: Not Loading + Has Products → NORMAL PRODUCTS
  if (!loading && products && products.length > 0) {
    return (
      <div className={`relative ${flexClasses} ${className}`}>
        {products.filter(product => product && product.id).map((product, index) => {
          try {
            return (
              <div
                key={product.id}
                className={`${layout === 'fixed' ? 'flex-shrink-0 w-72' : 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5'}`}
              >
                <ProductCard
                  product={product}
                  variant={variant}
                  imageIndex={index}
                  source={source}
                />
              </div>
            );
          } catch (error) {
            console.error('Error rendering product card:', error, product);
            return null;
          }
        })}
      </div>
    );
  }

  // PRIORITY 4: Not Loading + No Products → EMPTY STATE
  return (
    <div className={`${flexClasses} ${className}`}>
      <div className="w-full text-center py-12">
        <div className="text-gray-500 mb-4">
          {emptyMessage?.icon && (
            <div className="mx-auto mb-4">
              {emptyMessage.icon}
            </div>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage?.title || 'No Products Available'}
        </h3>
        <p className="text-gray-500">
          {emptyMessage?.description || 'Check back later for more products.'}
        </p>
      </div>
    </div>
  );
}

export default memo(ProductGrid);
