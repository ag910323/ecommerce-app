import { useRef, useState, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import ProductCard from "./ProductCard.tsx";
import type { ProductResponse } from "../types";

interface ProductCarouselProps {
  products: ProductResponse[];
  loading?: boolean;
  variant?: 'default' | 'sponsored' | 'deals' | 'recommended' | 'explore' | 'trending' | 'mixed';
  source?: 'HOME' | 'SHOP' | 'CATEGORY';
}

export default function ProductCarousel({
  products,
  loading = false,
  variant,
  source
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Calculate scroll amount based on container width (show ~4 products per scroll)
  const getScrollAmount = () => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      // Card width is 288px (w-72 = 18rem = 288px), gap is 16px (space-x-4)
      const cardWidth = 288 + 16; // card + gap
      // Scroll by approximately 4 cards worth
      return Math.floor(containerWidth / cardWidth) * cardWidth;
    }
    return 320; // fallback
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const amount = getScrollAmount();
      scrollRef.current.scrollBy({ left: -amount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const amount = getScrollAmount();
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4 items-stretch">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-72 h-full">
            <div className="bg-gray-200 animate-pulse rounded-lg min-h-[360px] h-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="Scroll right"
        >
          <HiChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scroll-smooth pb-4 items-stretch"
        onScroll={checkScrollButtons}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-72 h-full">
            <ProductCard
              product={product}
              variant={variant}
              source={source}
            />
          </div>
        ))}
      </div>
    </div>
  );
}