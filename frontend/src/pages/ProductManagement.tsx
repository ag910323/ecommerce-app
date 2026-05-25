import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiPhotograph, HiSearch, HiChevronLeft, HiChevronRight, HiStar } from 'react-icons/hi';
import { productApi } from '../api/productApi';
import { useBrands } from '../context/BrandContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { ProductResponse, ProductFilterRequest } from '../types';
import Header from './Header';
import CategoryBar from './CategoryBar';

export default function ProductManagement() {
  const { parentCategories } = useCategories();
  const { allBrands, refreshAllBrands } = useBrands();
  const { token, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Sponsorship modal state
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [selectedProductForSponsorship, setSelectedProductForSponsorship] = useState<ProductResponse | null>(null);
  const [sponsorshipLoading, setSponsorshipLoading] = useState(false);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedPartnershipLevels, setSelectedPartnershipLevels] = useState<string[]>([]);
  const [selectedSponsorshipStatus, setSelectedSponsorshipStatus] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>();
  const [minStock, setMinStock] = useState<number | undefined>();

  // Helper function for reloading current page
  const reloadProducts = () => loadProducts(currentPage);

  // Load products function
  const loadProducts = async (page: number = currentPage) => {
    await loadProductsWithFilters(page);
  };

  // Main function to load products with filters
  const loadProductsWithFilters = async (page: number = 0, filters?: {
    search?: string;
    categories?: number[];
    statuses?: string[];
    brandIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    partnershipLevels?: string[];
    sponsorshipStatus?: string[];
    minRating?: number;
    maxDiscount?: number;
    minStock?: number;
  }) => {
    try {
      setFilterLoading(true);
      setError('');
      
      // Check authentication
      if (!token || !user) {
        setError('You must be logged in as a seller to view your products');
        setProducts([]);
        return;
      }

      if (!user.roleNames.includes('SELLER')) {
        setError('You must have seller privileges to manage products');
        setProducts([]);
        return;
      }
      
      console.log('Fetching seller products for seller ID:', user.sellerResponse?.id);
      
      // Use provided filters or current state
      const currentFilters = filters || {
        search: searchTerm,
        categories: selectedCategories,
        statuses: selectedStatuses,
        brandIds: selectedBrands,
        minPrice,
        maxPrice,
        partnershipLevels: selectedPartnershipLevels,
        sponsorshipStatus: selectedSponsorshipStatus,
        minRating,
        maxDiscount,
        minStock
      };
      
      // Build filter request
      const filterRequest: ProductFilterRequest = {
        sellerId: user.sellerResponse?.id,
        categoryIds: currentFilters.categories && currentFilters.categories.length > 0 ? currentFilters.categories : undefined,
        search: currentFilters.search && currentFilters.search.trim() !== '' ? currentFilters.search.trim() : undefined,
        minPrice: currentFilters.minPrice,
        maxPrice: currentFilters.maxPrice,
        brandIds: currentFilters.brandIds && currentFilters.brandIds.length > 0 ? currentFilters.brandIds : undefined,
        statuses: currentFilters.statuses && currentFilters.statuses.length > 0 ? currentFilters.statuses : undefined,
        pagination: {
          page: page,
          size: pageSize,
          sortBy: 'id',
          sortDir: 'desc'
        }
      };

      console.log('Filter request:', filterRequest);

      try {
        // Try the advanced filter API first
        const pagedResponse = await productApi.filterSellerProducts(user.sellerResponse?.id, filterRequest);
        
        console.log('Filtered seller products loaded:', pagedResponse);
        let filteredProducts = pagedResponse.content;

        // Apply client-side filtering for the new filter types
        if (currentFilters.sponsorshipStatus && currentFilters.sponsorshipStatus.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            return currentFilters.sponsorshipStatus!.some(status => {
              if (status === 'SPONSORED') return product.isSponsored;
              if (status === 'NOT_SPONSORED') return !product.isSponsored;
              return false;
            });
          });
        }
        
        if (currentFilters.partnershipLevels && currentFilters.partnershipLevels.length > 0) {
          filteredProducts = filteredProducts.filter(product => 
            currentFilters.partnershipLevels!.includes(product.brandPartnershipLevel || 'NONE')
          );
        }
        
        if (currentFilters.minRating !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.rating || 0) >= currentFilters.minRating!
          );
        }
        
        if (currentFilters.maxDiscount !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.discountPercentage || 0) <= currentFilters.maxDiscount!
          );
        }
        
        if (currentFilters.minStock !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.stockQuantity || 0) >= currentFilters.minStock!
          );
        }

        setProducts(filteredProducts);
        setTotalElements(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / pageSize));
        setCurrentPage(page);
        setError('');

      } catch (filterError: any) {
        console.warn('Advanced filter failed, trying basic API:', filterError);
        
        // Fallback to basic seller products API
        const basicProducts = await productApi.getProductsBySeller(user.sellerResponse?.id);
        
        // Apply all filters client-side
        let filteredProducts = basicProducts;
        
        if (filterRequest.search) {
          const searchLower = filterRequest.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower)) ||
            (product.brandName && product.brandName.toLowerCase().includes(searchLower))
          );
        }
        
        if (filterRequest.categoryIds && filterRequest.categoryIds.length > 0) {
          filteredProducts = filteredProducts.filter(product => 
            filterRequest.categoryIds!.includes(product.categoryId || 0)
          );
        }
        
        if (filterRequest.statuses && filterRequest.statuses.length > 0) {
          filteredProducts = filteredProducts.filter(product => 
            filterRequest.statuses!.includes(product.status)
          );
        }
        
        if (filterRequest.brandIds && filterRequest.brandIds.length > 0) {
          filteredProducts = filteredProducts.filter(product => 
            filterRequest.brandIds!.includes(product.brandId || 0)
          );
        }
        
        if (filterRequest.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.price >= filterRequest.minPrice!);
        }
        if (filterRequest.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.price <= filterRequest.maxPrice!);
        }

        // Apply additional filters
        if (currentFilters.sponsorshipStatus && currentFilters.sponsorshipStatus.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            return currentFilters.sponsorshipStatus!.some(status => {
              if (status === 'SPONSORED') return product.isSponsored;
              if (status === 'NOT_SPONSORED') return !product.isSponsored;
              return false;
            });
          });
        }
        
        if (currentFilters.partnershipLevels && currentFilters.partnershipLevels.length > 0) {
          filteredProducts = filteredProducts.filter(product => 
            currentFilters.partnershipLevels!.includes(product.brandPartnershipLevel || 'NONE')
          );
        }
        
        if (currentFilters.minRating !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.rating || 0) >= currentFilters.minRating!
          );
        }
        
        if (currentFilters.maxDiscount !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.discountPercentage || 0) <= currentFilters.maxDiscount!
          );
        }
        
        if (currentFilters.minStock !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            (product.stockQuantity || 0) >= currentFilters.minStock!
          );
        }
        
        // Apply pagination client-side
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setTotalElements(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / pageSize));
        setCurrentPage(page);
        setError('');
        
        addNotification({
          type: 'warning',
          title: 'Using Client-side Filtering',
          message: 'Server filtering temporarily unavailable. Using client-side filtering instead.'
        });
      }
    } catch (err: any) {
      console.error('Failed to load seller products:', err);
      setProducts([]);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access products.');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to load your products';
        setError(errorMessage);
      }
    } finally {
      setFilterLoading(false);
    }
  };

  // Initial load on component mount
  const initialLoadProducts = async () => {
    try {
      setLoading(true);
      await loadProductsWithFilters(0);
    } finally {
      setLoading(false);
    }
  };

  // Load brands for filter dropdown - now using context
  const loadBrands = async () => {
    await refreshAllBrands();
  };

  // useEffect hooks
  useEffect(() => {
    if (token && user) {
      initialLoadProducts();
      loadBrands();
    }
  }, [token, user]);

  // Filter change handlers
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        loadProductsWithFilters(0);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedCategories, selectedStatuses, selectedBrands, selectedPartnershipLevels, selectedSponsorshipStatus, minPrice, maxPrice, minRating, maxDiscount, minStock]);

  // Product deletion function
  const openSponsorshipModal = (product: ProductResponse) => {
    setSelectedProductForSponsorship(product);
    setShowSponsorshipModal(true);
  };

  const closeSponsorshipModal = () => {
    setShowSponsorshipModal(false);
    setSelectedProductForSponsorship(null);
    setSponsorshipLoading(false);
  };

  const handleSponsorshipAction = async (action: 'sponsor' | 'remove') => {
    if (!selectedProductForSponsorship) return;

    setSponsorshipLoading(true);
    
    try {
      const product = selectedProductForSponsorship;
      
      // Prepare sponsorship data for backend
      const now = new Date();
      const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
      // Format dates as LocalDateTime expects (YYYY-MM-DDTHH:mm:ss)
      const formatLocalDateTime = (date: Date) => {
        return date.toISOString().slice(0, 19); // Remove 'Z' and milliseconds
      };
      
      const sponsorshipData = {
        isSponsored: action === 'sponsor',
        ...(action === 'sponsor' && {
          // Only include these fields when sponsoring (not when removing)
          sponsorPriority: product.sponsorPriority || 10,
          sponsorStartDate: formatLocalDateTime(now),
          sponsorEndDate: formatLocalDateTime(endDate),
          sponsorBudget: product.sponsorBudget || 1000,
          sponsorCostPerClick: product.sponsorCostPerClick || 5
        })
      };

      console.log('Sending sponsorship data:', sponsorshipData);
      
      await productApi.updateProductSponsorship(product.id, sponsorshipData);
      
      addNotification({
        type: 'success',
        title: action === 'sponsor' ? '🌟 Product Sponsored!' : '✅ Sponsorship Removed',
        message: action === 'sponsor'
          ? `${product.name} is now sponsored and will appear in premium positions with enhanced visibility!`
          : `${product.name} sponsorship has been removed. All active campaigns have been paused.`
      });
      
      closeSponsorshipModal();
      await reloadProducts();
    } catch (err: any) {
      console.error('Failed to update sponsorship:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update sponsorship';
      addNotification({
        type: 'error',
        title: 'Sponsorship Update Failed',
        message: errorMessage
      });
      setSponsorshipLoading(false);
    }
  };

  // Handle delete product
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productApi.deleteProduct(id);
      addNotification({
        type: 'success',
        title: 'Product Deleted',
        message: `${name} has been removed from the system`
      });
      await reloadProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage
      });
    }
  };

  // Show login prompt if not authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryBar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You need to be logged in as a seller to access product management.</p>
            <a
              href="/login"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Login to Continue</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />
      
      {/* Main Loading Spinner - only for initial load */}
      {loading ? (
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your products...</p>
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
                  <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                  <p className="text-gray-600 mt-1">Manage your marketplace products - add, edit, and organize your inventory</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/seller/products/add')}
                className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <HiPlus className="w-5 h-5" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* Main Layout - Filters on Left, Content on Right */}
          <div className="flex gap-6">
            {/* Left Filter Panel - Fixed Width */}
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
                  {/* Search Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Search</h4>
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              }
                            }}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Status</h4>
                    <div className="space-y-2">
                      {['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'].map(status => (
                        <label key={status} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatuses([...selectedStatuses, status]);
                              } else {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                              }
                            }}
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

                  {/* Sponsorship Filter */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Sponsorship</h4>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSponsorshipStatus.includes('SPONSORED')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSponsorshipStatus([...selectedSponsorshipStatus, 'SPONSORED']);
                            } else {
                              setSelectedSponsorshipStatus(selectedSponsorshipStatus.filter(s => s !== 'SPONSORED'));
                            }
                          }}
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
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSponsorshipStatus([...selectedSponsorshipStatus, 'NOT_SPONSORED']);
                            } else {
                              setSelectedSponsorshipStatus(selectedSponsorshipStatus.filter(s => s !== 'NOT_SPONSORED'));
                            }
                          }}
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
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPartnershipLevels([...selectedPartnershipLevels, level]);
                              } else {
                                setSelectedPartnershipLevels(selectedPartnershipLevels.filter(l => l !== level));
                              }
                            }}
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
                            onChange={(e) => setMinRating(e.target.checked ? rating : undefined)}
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
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maxDiscount === 100}
                          onChange={(e) => setMaxDiscount(e.target.checked ? 100 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Any Discount</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maxDiscount === 50}
                          onChange={(e) => setMaxDiscount(e.target.checked ? 50 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Up to 50% off</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maxDiscount === 30}
                          onChange={(e) => setMaxDiscount(e.target.checked ? 30 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Up to 30% off</span>
                      </label>
                    </div>
                  </div>

                  {/* Stock Level Filter */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm tracking-wide">Stock Level</h4>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minStock === 1}
                          onChange={(e) => setMinStock(e.target.checked ? 1 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">In Stock</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minStock === 10}
                          onChange={(e) => setMinStock(e.target.checked ? 10 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">10+ Units</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minStock === 50}
                          onChange={(e) => setMinStock(e.target.checked ? 50 : undefined)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">50+ Units</span>
                      </label>
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
                          onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                          onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand.id]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                              }
                            }}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 rounded cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="border-t border-gray-200 pt-6">
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedStatuses([]);
                        setSelectedPartnershipLevels([]);
                        setSelectedSponsorshipStatus([]);
                        setMinPrice(undefined);
                        setMaxPrice(undefined);
                        setSelectedBrands([]);
                        setMinRating(undefined);
                        setMaxDiscount(undefined);
                        setMinStock(undefined);
                        setSearchTerm('');
                        setCurrentPage(0);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area - Expanded */}
            <div className="flex-1 min-w-0">
              {/* Seller Stats Dashboard */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HiPhotograph className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Total Products</p>
                      <p className="text-lg font-bold text-gray-900">{totalElements}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Active</p>
                      <p className="text-lg font-bold text-gray-900">
                        {products.filter(p => p.status === 'ACTIVE').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <HiStar className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Sponsored</p>
                      <p className="text-lg font-bold text-gray-900">
                        {products.filter(p => p.isSponsored).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Low Stock</p>
                      <p className="text-lg font-bold text-gray-900">
                        {products.filter(p => (p.stockQuantity || 0) < 10).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Total Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${products.reduce((sum, p) => sum + (p.price * (p.stockQuantity || 0)), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter loading indicator */}
              {filterLoading && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700">Applying filters...</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-800 font-medium">❌ {error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Items per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value));
                          setCurrentPage(0);
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {products.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <HiPhotograph className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate('/seller/products/add')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <HiPlus className="-ml-1 mr-2 h-5 w-5" />
                        Add Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {product.imageUrls && product.imageUrls.length > 0 ? (
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover"
                                      src={product.imageUrls[0]}
                                      alt={product.name}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <HiPhotograph className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                    {product.isSponsored && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200">
                                        <HiStar className="w-3 h-3 mr-1" />
                                        Sponsored
                                      </span>
                                    )}
                                    {product.partnershipBadge && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200">
                                        {product.partnershipBadge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                                    <span>{product.brandName || product.brand}</span>
                                    {product.sku && (
                                      <>
                                        <span>•</span>
                                        <span>SKU: {product.sku}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span className="font-medium">${product.price.toFixed(2)}</span>
                                {product.discountPercentage && product.discountPercentage > 0 && (
                                  <span className="text-xs text-green-600">{product.discountPercentage}% off</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-col">
                                <span className={`font-medium ${
                                  (product.stockQuantity || 0) < 10 ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {product.stockQuantity || 0} units
                                </span>
                                {(product.stockQuantity || 0) < 10 && (
                                  <span className="text-xs text-red-500">Low Stock</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                product.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                product.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.status === 'ACTIVE' ? 'Active' : 
                                 product.status === 'INACTIVE' ? 'Inactive' : 
                                 product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Discontinued'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center space-y-1">
                                {product.isSponsored ? (
                                  <div className="flex flex-col items-center space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <HiStar className="w-3 h-3 mr-1 fill-yellow-500" />
                                        Active
                                      </span>
                                      {product.sponsorPriority && product.sponsorPriority > 0 && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          P{product.sponsorPriority}
                                        </span>
                                      )}
                                    </div>
                                    {(product.sponsorBudget || product.sponsorCostPerClick) && (
                                      <div className="text-xs text-gray-600 text-center">
                                        {product.sponsorBudget && (
                                          <div>Budget: ${product.sponsorBudget}</div>
                                        )}
                                        {product.sponsorCostPerClick && (
                                          <div>CPC: ${product.sponsorCostPerClick}</div>
                                        )}
                                      </div>
                                    )}
                                    {product.sponsorEndDate && (
                                      <div className="text-xs text-gray-500">
                                        Ends: {new Date(product.sponsorEndDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Not Sponsored</span>
                                )}
                                {product.brandPartnershipLevel && product.brandPartnershipLevel !== 'NONE' && (
                                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                                    {product.brandPartnershipLevel}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => openSponsorshipModal(product)}
                                  className={`p-1 bg-white transition-all duration-200 hover:scale-110 ${
                                    product.isSponsored 
                                      ? 'text-yellow-600 hover:text-yellow-700 shadow-md hover:shadow-lg' 
                                      : 'text-gray-400 hover:text-yellow-500'
                                  }`}
                                  style={{ 
                                    backgroundColor: 'white', 
                                    color: product.isSponsored ? '#d97706' : '#9ca3af' 
                                  }}
                                  title={product.isSponsored ? 'Manage sponsorship' : 'Make sponsored'}
                                >
                                  <HiStar className={`w-4 h-4 transition-all duration-200 ${
                                    product.isSponsored ? 'fill-yellow-500 drop-shadow-sm' : ''
                                  }`} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="text-red-500 hover:text-red-600 p-1 bg-white transition-colors"
                                  style={{ backgroundColor: 'white', color: '#dc2626' }}
                                  title="Delete product"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination */}
                {products.length > 0 && totalElements > 0 && (
                  <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} products
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HiChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                          if (pageNum >= totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                pageNum === currentPage
                                  ? 'bg-orange-500 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <HiChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sponsorship Modal */}
      {showSponsorshipModal && selectedProductForSponsorship && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                    <HiStar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedProductForSponsorship.isSponsored ? 'Manage Sponsorship' : 'Sponsor Product'}
                    </h2>
                    <p className="text-yellow-100">
                      {selectedProductForSponsorship.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeSponsorshipModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Preview Section */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Product Details</h3>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {selectedProductForSponsorship.imageUrls && selectedProductForSponsorship.imageUrls.length > 0 ? (
                      <img
                        className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                        src={selectedProductForSponsorship.imageUrls[0]}
                        alt={selectedProductForSponsorship.name}
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <HiPhotograph className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{selectedProductForSponsorship.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {selectedProductForSponsorship.brandName || 'No Brand'}
                          </span>
                          {selectedProductForSponsorship.sku && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              SKU: {selectedProductForSponsorship.sku}
                            </span>
                          )}
                        </div>
                        {selectedProductForSponsorship.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{selectedProductForSponsorship.description}</p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-gray-900">${selectedProductForSponsorship.price.toFixed(2)}</div>
                        {selectedProductForSponsorship.discountPercentage && selectedProductForSponsorship.discountPercentage > 0 && (
                          <div className="text-sm text-green-600 font-medium">{selectedProductForSponsorship.discountPercentage}% OFF</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProductForSponsorship.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          selectedProductForSponsorship.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          selectedProductForSponsorship.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedProductForSponsorship.status === 'ACTIVE' ? 'Active' : 
                           selectedProductForSponsorship.status === 'INACTIVE' ? 'Inactive' : 
                           selectedProductForSponsorship.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Discontinued'}
                        </span>
                        <span className={`text-sm font-medium ${
                          (selectedProductForSponsorship.stockQuantity || 0) < 10 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          Stock: {selectedProductForSponsorship.stockQuantity || 0} units
                        </span>
                        {selectedProductForSponsorship.rating && selectedProductForSponsorship.rating > 0 && (
                          <span className="flex items-center text-yellow-600">
                            <HiStar className="w-4 h-4 fill-yellow-400 mr-1" />
                            {selectedProductForSponsorship.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedProductForSponsorship.isSponsored && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200">
                            <HiStar className="w-3 h-3 mr-1 fill-yellow-500" />
                            Currently Sponsored
                          </span>
                        )}
                        {selectedProductForSponsorship.brandPartnershipLevel && selectedProductForSponsorship.brandPartnershipLevel !== 'NONE' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {selectedProductForSponsorship.brandPartnershipLevel} Partner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedProductForSponsorship.isSponsored ? (
                /* Already Sponsored - Show Current Status */
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <HiStar className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800">Currently Sponsored</h3>
                        <p className="text-yellow-600">This product is actively promoted</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Budget</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${selectedProductForSponsorship.sponsorBudget || 1000}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Cost Per Click</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${selectedProductForSponsorship.sponsorCostPerClick || 5}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Priority</p>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedProductForSponsorship.sponsorPriority || 10}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Ends</p>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedProductForSponsorship.sponsorEndDate 
                            ? new Date(selectedProductForSponsorship.sponsorEndDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Benefits You're Getting:
                    </h4>
                    <ul className="space-y-1 text-green-700 text-sm">
                      <li>• Higher search result rankings</li>
                      <li>• Featured placement in category listings</li>
                      <li>• Increased visibility to potential customers</li>
                      <li>• Priority display with "Sponsored" badge</li>
                      <li>• Enhanced product discovery</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSponsorshipAction('remove')}
                      disabled={sponsorshipLoading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {sponsorshipLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Remove Sponsorship</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={closeSponsorshipModal}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      Keep Active
                    </button>
                  </div>
                </div>
              ) : (
                /* Not Sponsored - Show Benefits and Sponsor Option */
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                      <HiStar className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Boost Your Product's Visibility!</h3>
                    <p className="text-gray-600">Make your product stand out and reach more customers</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Sponsorship Benefits:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-800">Premium Placement</p>
                          <p className="text-blue-600 text-sm">Top positions in search results</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-800">Increased Visibility</p>
                          <p className="text-blue-600 text-sm">3x more product views</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-800">Featured Badge</p>
                          <p className="text-blue-600 text-sm">Special "Sponsored" highlight</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-800">Better Discovery</p>
                          <p className="text-blue-600 text-sm">Enhanced algorithm ranking</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Package Details:</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">$1,000</p>
                        <p className="text-yellow-700 text-sm">Total Budget</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">$5</p>
                        <p className="text-yellow-700 text-sm">Per Click</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">30</p>
                        <p className="text-yellow-700 text-sm">Days Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSponsorshipAction('sponsor')}
                      disabled={sponsorshipLoading}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
                    >
                      {sponsorshipLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <HiStar className="w-6 h-6 fill-white" />
                          <span>Start Sponsorship</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={closeSponsorshipModal}
                      className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
