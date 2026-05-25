import { memo, useCallback } from "react";
import ProductCarousel from "./ProductCarousel.tsx";
import { useNavigate } from "react-router-dom";
import type { ProductResponse } from "../types";

interface SponsoredSectionProps {
  products: ProductResponse[];
  loading: boolean;
}

function SponsoredSection({ products, loading }: SponsoredSectionProps) {
  const navigate = useNavigate();
  const hasProducts = products.length > 0;
  const buttonDisabled = !hasProducts || loading;

  const handleNavigate = useCallback(() => {
    if (!buttonDisabled) {
      navigate('/sponsored');
    }
  }, [navigate, buttonDisabled]);

  // ALWAYS render section container to prevent layout shifts
  return (
    <section className="py-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-t-2 border-yellow-200 min-h-[350px] transition-opacity duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sponsored Products</h2>
            <p className="text-gray-600">Featured products from our sellers and brand partners</p>
          </div>
          <button
            className={`bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors ${buttonDisabled ? 'opacity-50 cursor-not-allowed hover:bg-black' : 'hover:bg-gray-800'}`}
            onClick={handleNavigate}
            disabled={buttonDisabled}
          >
            View All
          </button>
        </div>

        {loading ? (
          // Show skeleton during loading
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-72">
                <div className="bg-gray-200 animate-pulse rounded-lg min-h-[360px]"></div>
              </div>
            ))}
          </div>
        ) : hasProducts ? (
          // Show products when available
          <ProductCarousel
            products={products}
            loading={loading}
            variant="sponsored"
            source="HOME"
          />
        ) : (
          // Show empty state when no products
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sponsored Products</h3>
            <p className="text-gray-500">Check back later for featured products.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(SponsoredSection);
