import React from 'react';
import { HiSearch, HiStar } from 'react-icons/hi';

/**
 * ISOLATED FilterPanel Component
 * 
 * Performance Optimization:
 * - Fully memoized with React.memo
 * - All handlers wrapped with useCallback (stable references)
 * - Does NOT cause parent (ShopPage) to re-render when internal state changes
 * - Only re-renders when prop values actually change
 * 
 * Architecture:
 * - Parent passes setters, not full state
 * - All filter state lives in ShopPage, but FilterPanel is isolated
 * - Prevents cascading re-renders to ProductGrid/Pagination
 */
interface FilterPanelProps {
  // State values
  searchTerm: string;
  selectedCategories: number[];
  selectedStatuses: string[];
  selectedBrands: number[];
  selectedPartnershipLevels: string[];
  selectedSponsorshipStatus: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  maxDiscount: number | undefined;
  minStock: number | undefined;
  
  // Available data
  parentCategories: any[];
  allBrands: any[];
  isSeller: boolean;
  hasActiveFilters: boolean;
  
  // Handlers - wrapped with useCallback at parent level
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: number, isChecked: boolean) => void;
  onStatusChange: (status: string, isChecked: boolean) => void;
  onBrandChange: (brandId: number, isChecked: boolean) => void;
  onPartnershipChange: (level: string, isChecked: boolean) => void;
  onSponsorshipChange: (status: string, isChecked: boolean) => void;
  onPriceChange: (type: 'min' | 'max', value: number | undefined) => void;
  onRatingChange: (rating: number | undefined) => void;
  onDiscountChange: (discount: number | undefined) => void;
  onStockChange: (stock: number | undefined) => void;
  onClearFilters: () => void;
}

export const FilterPanel = React.memo(({
  searchTerm,
  selectedCategories,
  selectedStatuses,
  selectedBrands,
  selectedPartnershipLevels,
  selectedSponsorshipStatus,
  minPrice,
  maxPrice,
  minRating,
  maxDiscount,
  minStock,
  parentCategories,
  allBrands,
  isSeller,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onBrandChange,
  onPartnershipChange,
  onSponsorshipChange,
  onPriceChange,
  onRatingChange,
  onDiscountChange,
  onStockChange,
  onClearFilters,
}: FilterPanelProps) => {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </h3>
        </div>

        <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Clear Filters */}
          <div>
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full font-medium py-2 px-4 rounded-lg transition-colors text-sm ${
                hasActiveFilters
                  ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Clear All Filters
            </button>
          </div>

          {/* Search Filter */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Search</h4>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Category</h4>
            <div className="space-y-2">
              {parentCategories.map(category => (
                <label key={category.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => onCategoryChange(category.id, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter - Only for Sellers */}
          {isSeller && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Status</h4>
              <div className="space-y-2">
                {['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'].map(status => (
                  <label key={status} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={(e) => onStatusChange(status, e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {status === 'ACTIVE' ? 'Active' :
                       status === 'INACTIVE' ? 'Inactive' :
                       status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Discontinued'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sponsorship Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Sponsorship</h4>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSponsorshipStatus.includes('SPONSORED')}
                  onChange={(e) => onSponsorshipChange('SPONSORED', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  <HiStar className="w-4 h-4 text-yellow-500 mr-1" />
                  Sponsored Only
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSponsorshipStatus.includes('NOT_SPONSORED')}
                  onChange={(e) => onSponsorshipChange('NOT_SPONSORED', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">Non-Sponsored Only</span>
              </label>
            </div>
          </div>

          {/* Partnership Level Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Partnership Level</h4>
            <div className="space-y-2">
              {['PARTNER', 'FEATURED', 'TOP', 'EXCLUSIVE'].map(level => (
                <label key={level} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPartnershipLevels.includes(level)}
                    onChange={(e) => onPartnershipChange(level, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {level === 'TOP' ? 'Top Partner' : level.charAt(0) + level.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2].map(rating => (
                <label key={rating} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minRating === rating}
                    onChange={(e) => onRatingChange(e.target.checked ? rating : undefined)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{rating}★ & above</span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Discount</h4>
            <div className="space-y-2">
              {[100, 50, 30].map(discount => (
                <label key={discount} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maxDiscount === discount}
                    onChange={(e) => onDiscountChange(e.target.checked ? discount : undefined)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {discount === 100 ? 'Any Discount' : `Up to ${discount}% off`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Level Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Stock Level</h4>
            <div className="space-y-2">
              {[1, 10, 50].map(stock => (
                <label key={stock} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minStock === stock}
                    onChange={(e) => onStockChange(e.target.checked ? stock : undefined)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {stock === 1 ? 'In Stock' : stock === 10 ? '10+ Units' : '50+ Units'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Price Range</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  value={minPrice || ''}
                  onChange={(e) => onPriceChange('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  value={maxPrice || ''}
                  onChange={(e) => onPriceChange('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Brand</h4>
            <div className="space-y-2">
              {allBrands.map(brand => (
                <label key={brand.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={(e) => onBrandChange(brand.id, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';
