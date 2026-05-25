import { useState, useEffect, useCallback, memo } from "react";
import ProductCarousel from "./ProductCarousel.tsx";
import { useNavigate } from "react-router-dom";
import { productApi } from "../api/productApi";
import type { ProductResponse } from "../types";
import { PRODUCT_STATUS } from "../types";

function ExploreSection() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Load fixed number of products (12) on mount
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productApi.filterProducts({
        pagination: {
          page: 0,
          size: 12,
          sortBy: 'name',
          sortDir: 'asc'
        }
      });

      // Validate response
      if (!response || typeof response !== 'object' || !Array.isArray(response.content)) {
        throw new Error('Invalid API response format');
      }

      const newProducts = response.content || [];

      // Validate each product has required fields
      const validProducts = newProducts.filter(product => {
        if (!product || typeof product !== 'object') return false;
        if (!product.name || !product.price) return false;
        return true;
      });

      setProducts(validProducts);
    } catch (error) {
      console.error('ExploreSection - Load products error:', error);
      // Fallback with some static data
      const fallbackProducts = [
        {
          id: 9,
          name: "Laptop Stand",
          description: "Adjustable aluminum laptop stand",
          price: 2499,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop"],
          rating: 4.5,
          discountPercentage: 20
        },
        {
          id: 10,
          name: "Wireless Mouse",
          description: "Ergonomic wireless mouse",
          price: 899,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop"],
          rating: 4.2,
          discountPercentage: 15
        }
      ];
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const hasProducts = products.length > 0;
  const buttonDisabled = !hasProducts || loading;

  const handleBrowseAll = useCallback(() => {
    if (!buttonDisabled) {
      navigate('/shop');
    }
  }, [navigate, buttonDisabled]);

  // ALWAYS render section container to prevent layout shifts
  return (
    <section className="py-8 bg-white border-t border-gray-200 min-h-[350px] transition-opacity duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Explore Products</h2>
            <p className="text-gray-600">Browse our amazing products</p>
          </div>
          <button
            className={`bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors ${buttonDisabled ? 'opacity-50 cursor-not-allowed hover:bg-black' : 'hover:bg-gray-800'}`}
            onClick={handleBrowseAll}
            disabled={buttonDisabled}
          >
            Browse All
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
            variant="explore"
            source="HOME"
          />
        ) : (
          // Show empty state when no products
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">Check back later for new products.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(ExploreSection);
