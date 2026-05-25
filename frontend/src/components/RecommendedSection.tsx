import { memo, useCallback } from "react";
import ProductCarousel from "./ProductCarousel.tsx";
import { useNavigate } from "react-router-dom";
import type { ProductResponse } from "../types";

interface RecommendedSectionProps {
  products: ProductResponse[];
  loading: boolean;
}

function RecommendedSection({ products, loading }: RecommendedSectionProps) {
  const navigate = useNavigate();
  const hasProducts = products.length > 0;
  const buttonDisabled = !hasProducts || loading;

  const handleNavigate = useCallback(() => {
    if (!buttonDisabled) {
      navigate('/recommended');
    }
  }, [navigate, buttonDisabled]);

  // ALWAYS render section container to prevent layout shifts
  return (
    <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50 min-h-[350px] transition-opacity duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-600">Based on your shopping history and preferences</p>
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
            variant="recommended"
            source="HOME"
          />
        ) : (
          // Show empty state when no products
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-500">Start shopping to get personalized recommendations.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(RecommendedSection);
