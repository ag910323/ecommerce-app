import { memo, useCallback } from "react";
import ProductCarousel from "./ProductCarousel.tsx";
import { useNavigate } from "react-router-dom";
import type { ProductResponse } from "../types";

interface DealsSectionProps {
  products: ProductResponse[];
  loading: boolean;
}

function DealsSection({ products, loading }: DealsSectionProps) {
  const navigate = useNavigate();
  const hasProducts = products.length > 0;
  const buttonDisabled = !hasProducts || loading;

  const handleNavigate = useCallback(() => {
    if (!buttonDisabled) {
      navigate('/deals');
    }
  }, [navigate, buttonDisabled]);

  // ALWAYS render section container to prevent layout shifts
  return (
    <section className="py-8 bg-gray-50 min-h-[350px] transition-opacity duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deals of the Day</h2>
            <p className="text-gray-600">Limited time offers on selected products</p>
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
            variant="deals"
            source="HOME"
          />
        ) : (
          // Show empty state when no products
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Deals Available</h3>
            <p className="text-gray-500">Check back later for great offers.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(DealsSection);
