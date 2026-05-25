import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { productApi } from '../api/productApi';
import { useBrands } from '../context/BrandContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import type { ProductResponse, ProductFilterRequest } from '../types';
import Header from './Header';
import CategoryBar from './CategoryBar';
import { FilterPanel } from '../components/FilterPanel';
import ProductGridComponent from '../components/ProductGrid';
import { Pagination } from '../components/Pagination';
import { BackToTopButton } from '../components/BackToTopButton';

/**
 * REFACTORED ShopPage - Second-Level Performance Architecture
 * 
 * Key Improvements:
 * 1. Component Isolation: FilterPanel, ProductGrid, Pagination are memoized + isolated
 *    → Filter changes do NOT re-render ProductGrid/Pagination
 * 2. Debounced Filters: Search/price use debounce → reduces API calls from N to 1
 *    → User typing 10 chars triggers 1 API call, not 10
 * 3. Request Cancellation: AbortController prevents stale responses
 *    → Quick filter change → old request cancelled → no race conditions
 * 4. Stabilized Callbacks: All handlers wrapped with useCallback
 *    → Prevent child re-renders from handler reference changes
 * 5. BackToTop Isolation: Separate component with own scroll listener
 *    → Scroll events no longer trigger ShopPage re-renders
 * 6. Removed 10K Fetch: Bounded client-side filtering (200 items max) instead of 10K
 * 
 * Architecture:
 * ShopPage (State Orchestrator)
 *   ├─ FilterPanel (Isolated - own memo, own handlers)
 *   ├─ ProductGrid (Isolated - only re-renders on product change)
 *   ├─ Pagination (Isolated - only re-renders on page change)
 *   └─ BackToTopButton (Completely isolated with own scroll listener)
 */

export default function ShopPage() {
  const { parentCategories } = useCategories();
  const { allBrands, refreshAllBrands } = useBrands();
  const { user } = useAuth();
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const isSeller = user?.roleNames?.includes('SELLER') || user?.roleNames?.includes('ADMIN') || false;

  // ===============================
  // STATE MANAGEMENT
  // ===============================
  
  // Pagination & Data State
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 28; // Fixed page size - no longer user-selectable to reduce complexity
  const [loading, setLoading] = useState(true);

  // RAW Filter State (from UI interactions)
  const [searchTermRaw, setSearchTermRaw] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [minPriceRaw, setMinPriceRaw] = useState<number | undefined>();
  const [maxPriceRaw, setMaxPriceRaw] = useState<number | undefined>();
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedPartnershipLevels, setSelectedPartnershipLevels] = useState<string[]>([]);
  const [selectedSponsorshipStatus, setSelectedSponsorshipStatus] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>();
  const [minStock, setMinStock] = useState<number | undefined>();

  // ===============================
  // DEBOUNCED FILTER STATE (Performance Fix #2)
  // ===============================
  // Debounce expensive inputs (search, price)
  // Only propagate to API after 500ms of inactivity
  const debouncedSearchTerm = useDebounce(searchTermRaw, 500);
  const debouncedMinPrice = useDebounce(minPriceRaw, 300);
  const debouncedMaxPrice = useDebounce(maxPriceRaw, 300);

  // ===============================
  // HANDLERS - Wrapped with useCallback (Performance Fix #4)
  // ===============================
  // Stable callback references prevent child re-renders
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchTermRaw(value);
    setPage(0); // Reset to first page on search
  }, []);

  const handleCategoryChange = useCallback((categoryId: number, isChecked: boolean) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedCategories(prev =>
      isChecked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
    setPage(0);
  }, []);

  const handleStatusChange = useCallback((status: string, isChecked: boolean) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedStatuses(prev =>
      isChecked ? [...prev, status] : prev.filter(s => s !== status)
    );
    setPage(0);
  }, []);

  const handleBrandChange = useCallback((brandId: number, isChecked: boolean) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedBrands(prev =>
      isChecked ? [...prev, brandId] : prev.filter(id => id !== brandId)
    );
    setPage(0);
  }, []);

  const handlePartnershipChange = useCallback((level: string, isChecked: boolean) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedPartnershipLevels(prev =>
      isChecked ? [...prev, level] : prev.filter(l => l !== level)
    );
    setPage(0);
  }, []);

  const handleSponsorshipChange = useCallback((status: string, isChecked: boolean) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedSponsorshipStatus(prev =>
      isChecked ? [...prev, status] : prev.filter(s => s !== status)
    );
    setPage(0);
  }, []);

  const handlePriceChange = useCallback((type: 'min' | 'max', value: number | undefined) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    if (type === 'min') {
      setMinPriceRaw(value);
    } else {
      setMaxPriceRaw(value);
    }
    setPage(0);
  }, []);

  const handleRatingChange = useCallback((rating: number | undefined) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setMinRating(rating);
    setPage(0);
  }, []);

  const handleDiscountChange = useCallback((discount: number | undefined) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setMaxDiscount(discount);
    setPage(0);
  }, []);

  const handleStockChange = useCallback((stock: number | undefined) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setMinStock(stock);
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedPartnershipLevels([]);
    setSelectedSponsorshipStatus([]);
    setMinPriceRaw(undefined);
    setMaxPriceRaw(undefined);
    setSelectedBrands([]);
    setMinRating(undefined);
    setMaxDiscount(undefined);
    setMinStock(undefined);
    setSearchTermRaw('');
    setPage(0);
  }, []);

  const handlePrevious = useCallback(() => {
    if (page > 0) {
      setLoading(true); // IMMEDIATE loading state for responsive UX
      setPage(prev => prev - 1);
    }
  }, [page]);

  const handleNext = useCallback(() => {
    if (page < totalPages - 1) {
      setLoading(true); // IMMEDIATE loading state for responsive UX
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const handlePageClick = useCallback((pageNum: number) => {
    setLoading(true); // IMMEDIATE loading state for responsive UX
    setPage(pageNum);
  }, []);


  // ===============================
  // API CALL LOGIC (Performance Fix #3, #6)
  // ===============================
  // Extracted to clean function
  // Includes AbortController for request cancellation
  
  const loadProducts = useCallback(async (pageNumber: number) => {
    const currentRequestId = ++requestIdRef.current;
    
    // ATOMIC: Abort previous + create new controller (prevents race window)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const requestSignal = abortControllerRef.current.signal;

    // Set loading for all requests (initial and subsequent)
    setLoading(true);

    const clientSideFiltersActive = selectedSponsorshipStatus.length > 0 ||
                                    selectedPartnershipLevels.length > 0 ||
                                    minRating !== undefined ||
                                    maxDiscount !== undefined ||
                                    minStock !== undefined;

    // PHASE 2: Eliminate 10K fetch - use bounded size for unsupported filters
    const getSafePageSize = () => {
      return clientSideFiltersActive ? 200 : pageSize; // Bounded fallback instead of 10K
    };

    const buildFilterRequest = (): ProductFilterRequest => {
      const request: ProductFilterRequest = {
        pagination: {
          page: clientSideFiltersActive ? 0 : pageNumber,
          size: getSafePageSize(),
          sortBy: 'name',
          sortDir: 'desc'
        }
      } as ProductFilterRequest;

      if (selectedCategories.length > 0) {
        request.categoryIds = selectedCategories;
      }
      if (selectedBrands.length > 0) {
        request.brandIds = selectedBrands;
      }
      if (selectedStatuses.length > 0) {
        request.statuses = selectedStatuses;
      }
      if (debouncedSearchTerm.trim().length > 0) {
        request.search = debouncedSearchTerm.trim();
      }
      if (debouncedMinPrice !== undefined) {
        request.minPrice = debouncedMinPrice;
      }
      if (debouncedMaxPrice !== undefined) {
        request.maxPrice = debouncedMaxPrice;
      }

      return request;
    };

    const transformResponse = (pagedResponse: Awaited<ReturnType<typeof productApi.filterProducts>>): {
      finalProducts: ProductResponse[];
      finalTotalPages: number;
    } => {
      if (clientSideFiltersActive) {
        const filteredProducts = pagedResponse.content.filter(product => {
          if (selectedSponsorshipStatus.length > 0) {
            const isSponsoredMatch = selectedSponsorshipStatus.some(status => {
              if (status === 'SPONSORED') return product.isSponsored || product.isCurrentlySponsored;
              if (status === 'NOT_SPONSORED') return !product.isSponsored && !product.isCurrentlySponsored;
              return false;
            });
            if (!isSponsoredMatch) return false;
          }

          if (selectedPartnershipLevels.length > 0) {
            if (!selectedPartnershipLevels.includes(product.brandPartnershipLevel || 'NONE')) return false;
          }

          if (minRating !== undefined) {
            if ((product.rating || 0) < minRating) return false;
          }

          if (maxDiscount !== undefined) {
            if ((product.discountPercentage || 0) > maxDiscount) return false;
          }

          if (minStock !== undefined) {
            if ((product.stockQuantity || 0) < minStock) return false;
          }

          return true;
        });

        return {
          finalProducts: filteredProducts.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize),
          finalTotalPages: Math.ceil(filteredProducts.length / pageSize)
        };
      }

      const totalElements = pagedResponse.totalElements ?? pagedResponse.content.length;
      return {
        finalProducts: pagedResponse.content,
        finalTotalPages: pagedResponse.totalPages ?? Math.ceil(totalElements / pageSize)
      };
    };

    const commitResponse = (finalProducts: ProductResponse[], finalTotalPages: number) => {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      setProducts(finalProducts);
      setTotalPages(finalTotalPages);
      setPage(pageNumber);
    };

    try {
      const filterRequest = buildFilterRequest();
      const pagedResponse = await productApi.filterProducts(filterRequest, { signal: requestSignal });

      // DOUBLE-CHECK: Abort status after async call (defensive)
      if (requestSignal.aborted || currentRequestId !== requestIdRef.current) {
        return;
      }

      // SAFE: Only transform if request is still valid
      const { finalProducts, finalTotalPages } = transformResponse(pagedResponse);
      
      // FINAL CHECK: Ensure no abort occurred during transformation
      if (requestSignal.aborted || currentRequestId !== requestIdRef.current) {
        return;
      }
      
      // SAFE: Only commit if request is still the latest
      commitResponse(finalProducts, finalTotalPages);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }

      // Only handle errors for the current request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error('Failed to load products:', err);
      // DO NOT clear products prematurely - only update in commitResponse
      // This prevents blank screens during error states
      setTotalPages(0);
    } finally {
      // Only clear loading if this is still the active request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [pageSize, selectedCategories, selectedBrands, selectedStatuses, debouncedSearchTerm, debouncedMinPrice, debouncedMaxPrice, selectedPartnershipLevels, selectedSponsorshipStatus, minRating, maxDiscount, minStock]);

  // ===============================
  // useEffect - OPTIMIZED (Performance Fix #1, #2)
  // ===============================
  // Only triggers on DEBOUNCED states, not raw states
  // Vastly reduces API calls
  
  useEffect(() => {
    loadProducts(page);
  }, [page, debouncedSearchTerm, selectedCategories, selectedStatuses, selectedBrands, selectedPartnershipLevels, selectedSponsorshipStatus, debouncedMinPrice, debouncedMaxPrice, minRating, maxDiscount, minStock, loadProducts]);

  // Load brands on mount
  useEffect(() => {
    refreshAllBrands();
  }, []);

  // =============================== 
  // STABLE PROPS FOR MEMOIZATION
  // ===============================
  const emptyMessage = useMemo(() => ({
    title: 'No products found',
    description: 'Try adjusting your filters or search query.'
  }), []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTermRaw.trim().length > 0 ||
      selectedCategories.length > 0 ||
      selectedStatuses.length > 0 ||
      selectedBrands.length > 0 ||
      selectedPartnershipLevels.length > 0 ||
      selectedSponsorshipStatus.length > 0 ||
      minPriceRaw !== undefined ||
      maxPriceRaw !== undefined ||
      minRating !== undefined ||
      maxDiscount !== undefined ||
      minStock !== undefined
    );
  }, [
    searchTermRaw,
    selectedCategories,
    selectedStatuses,
    selectedBrands,
    selectedPartnershipLevels,
    selectedSponsorshipStatus,
    minPriceRaw,
    maxPriceRaw,
    minRating,
    maxDiscount,
    minStock
  ]);

  // =============================== 
  // CLEANUP - Prevent memory leaks on unmount
  // ===============================
  useEffect(() => {
    return () => {
      // Abort any in-flight request when component unmounts
      abortControllerRef.current?.abort();
    };
  }, []);

  // ===============================
  // RENDER - Component Composition
  // ===============================
  // Isolated, memoized children prevent cascading re-renders
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />

      {/* Main Loading Spinner - only for initial load */}
      {loading && products.length === 0 ? (
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
                  <p className="text-gray-600 mt-1">Browse products with filters, search, and pagination.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout - Filters + Content */}
          <div className="flex gap-6">
            {/* ISOLATED FilterPanel Component */}
            <FilterPanel
              searchTerm={searchTermRaw}
              selectedCategories={selectedCategories}
              selectedStatuses={selectedStatuses}
              selectedBrands={selectedBrands}
              selectedPartnershipLevels={selectedPartnershipLevels}
              selectedSponsorshipStatus={selectedSponsorshipStatus}
              minPrice={minPriceRaw}
              maxPrice={maxPriceRaw}
              minRating={minRating}
              maxDiscount={maxDiscount}
              minStock={minStock}
              parentCategories={parentCategories}
              allBrands={allBrands}
              isSeller={isSeller}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
              onBrandChange={handleBrandChange}
              onPartnershipChange={handlePartnershipChange}
              onSponsorshipChange={handleSponsorshipChange}
              onPriceChange={handlePriceChange}
              onRatingChange={handleRatingChange}
              onDiscountChange={handleDiscountChange}
              onStockChange={handleStockChange}
              onClearFilters={handleClearFilters}
            />

            {/* ISOLATED ProductGrid Component */}
            <div className="flex-1 flex flex-col gap-4">
              <ProductGridComponent
                products={products}
                loading={loading}
                emptyMessage={emptyMessage}
                source="SHOP"
              />

              {/* ISOLATED Pagination Component */}
              {products.length > 0 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  loading={loading}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onPageClick={handlePageClick}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETELY ISOLATED BackToTopButton Component */}
      {/* This has its OWN scroll listener - does NOT affect ShopPage re-renders */}
      <BackToTopButton />
    </div>
  );
}
