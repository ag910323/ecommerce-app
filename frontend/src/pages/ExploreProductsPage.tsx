import { useState, useEffect } from "react";
import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import ProductGrid from "../components/ProductGrid.tsx";
import { useCategories } from "../context/CategoryContext";
import { productApi } from "../api/productApi";
import type { ProductResponse, ProductFilterRequest, PagedResponse } from "../types";
import { HiStar, HiFilter } from "react-icons/hi";

export default function ExploreProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { parentCategories } = useCategories();

  // Load products with filters
  const loadProducts = async (page: number = 0) => {
    console.log('Loading products for Explore page');
    try {
      setLoading(true);

      const filterRequest: ProductFilterRequest = {
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        search: searchQuery || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        pagination: {
          page,
          size: 20,
          sortBy,
          sortDir
        }
      };

      console.log('Filter request:', filterRequest);
      const response: PagedResponse<ProductResponse> = await productApi.filterProducts(filterRequest);
      console.log('Products response:', response);

      setProducts(response.content || []);
      setCurrentPage(response.page || 0);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount and when filters change
  useEffect(() => {
    loadProducts(0);
  }, [selectedCategories, minPrice, maxPrice, searchQuery, sortBy, sortDir]);

  // Handle category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by useEffect
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortBy("name");
    setSortDir("asc");
  };

  // Get all categories (flatten parent and sub categories)
  const getAllCategories = () => {
    const allCategories: { id: number; name: string }[] = [];
    parentCategories.forEach(parent => {
      allCategories.push({ id: parent.id, name: parent.name });
      if (parent.subCategories) {
        parent.subCategories.forEach(sub => {
          allCategories.push({ id: sub.id, name: `  ${sub.name}` });
        });
      }
    });
    return allCategories;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <Header />

      {/* Category Bar Section */}
      <CategoryBar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-6 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Explore Products</h1>
                <p className="text-gray-600 mt-1">Discover amazing products from our sellers</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => {
                    const [newSortBy, newSortDir] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortDir(newSortDir as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating-asc">Rating (Low to High)</option>
                  <option value="rating-desc">Rating (High to Low)</option>
                </select>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <HiFilter className="w-4 h-4" />
                  Filters
                  {selectedCategories.length > 0 && (
                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className={`w-80 bg-white rounded-lg shadow-sm border p-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="max-h-48 overflow-y-auto">
                  {getAllCategories().map(category => (
                    <label key={category.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Summary */}
              <div className="mb-4 text-sm text-gray-600">
                {totalElements > 0 ? (
                  <span>Showing {products.length} of {totalElements} products</span>
                ) : (
                  <span>No products found</span>
                )}
              </div>

              {/* Products */}
              <ProductGrid
                products={products}
                loading={loading}
                emptyMessage={{
                  title: "No Products Found",
                  description: "Try adjusting your filters or search terms.",
                  icon: <HiStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                }}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadProducts(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                      if (pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadProducts(pageNum)}
                          className={`px-3 py-2 border rounded-md text-sm ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => loadProducts(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">MyShop</h3>
              <p className="text-sm mb-4">Your one-stop destination for all shopping needs.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <div className="w-8 h-8 bg-pink-600 rounded"></div>
                <div className="w-8 h-8 bg-green-600 rounded"></div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <p className="text-sm mb-4">Subscribe to get updates on new arrivals and deals</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-md text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-blue-600 px-6 py-3 rounded-md text-white font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <hr className="my-8 border-gray-700" />
          <div className="text-center text-sm">
            © 2025 MyShop — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}