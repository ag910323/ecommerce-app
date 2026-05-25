import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiChevronRight, HiChevronLeft, HiSearch, HiFilter, HiX } from 'react-icons/hi';
import { categoryApi } from '../api/categoryApi';
import type { CategoryResponse, CategoryRequest } from '../types/product';
import { CATEGORY_STATUS } from '../types/product';
import type { CategoryFilterRequest } from '../types';
import { useCategories } from '../context/CategoryContext';
import Header from './Header';
import CategoryBar from './CategoryBar';

export default function CategoryManagement() {
  // State management
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Use shared category context for dropdown options only
  const { parentCategories, refreshCategories } = useCategories();
  
  // Local state for child categories and UI
  const [childCategories, setChildCategories] = useState<Record<number, CategoryResponse[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loadingChildren, setLoadingChildren] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    description: '',
    status: CATEGORY_STATUS.ACTIVE,
    parentCategoryId: undefined,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CategoryFilterRequest>({
    name: '',
    status: '',
    parentId: undefined,
  });

  // Ref to track if initial load is done
  const hasLoadedRef = useRef(false);

  // Load categories with pagination and filters
  const loadCategories = useCallback(async (page: number, useFilters: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      const filterRequest: CategoryFilterRequest = {
        page,
        size: pageSize,
        sortBy: 'name',
        direction: 'ASC'
      };

      // Apply search and filters
      if (useFilters || Object.values(filters).some(value => value !== '' && value !== undefined)) {
        if (searchTerm || filters.name) {
          filterRequest.name = searchTerm || filters.name;
        }
        if (filters.status) {
          filterRequest.status = filters.status;
        }
        if (filters.parentId) {
          filterRequest.parentId = filters.parentId;
        }
      } else if (searchTerm.trim()) {
        filterRequest.name = searchTerm;
      }
      
      const response = await categoryApi.filterCategories(filterRequest);
      
      setCategories(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages || Math.ceil(response.totalElements / pageSize));
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageSize, filters]); // Dependencies for useCallback

  // Load categories on component mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCategories(0);
    }
  }, [loadCategories]);

  // Refresh categories after CRUD operations
  const loadCategoriesData = async () => {
    await loadCategories(currentPage);
    await refreshCategories(); // Also refresh context for dropdowns
  };

  // Search categories
  const handleSearch = () => {
    setCurrentPage(0);
    loadCategories(0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    loadCategories(0);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(0);
    loadCategories(0, true);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      name: '',
      status: '',
      parentId: undefined,
    });
    setCurrentPage(0);
    loadCategories(0);
  };

  // Load child categories for a specific parent
  const loadChildCategories = async (parentId: number) => {
    if (childCategories[parentId]) {
      // Already loaded, just toggle expansion
      toggleCategoryExpansion(parentId);
      return;
    }

    try {
      setLoadingChildren(prev => new Set([...prev, parentId]));
      const children = await categoryApi.getChildCategories(parentId);
      setChildCategories(prev => ({
        ...prev,
        [parentId]: children
      }));
      setExpandedCategories(prev => new Set([...prev, parentId]));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load child categories');
    } finally {
      setLoadingChildren(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        // Update existing category
        await categoryApi.updateCategory(editingCategory.id, formData);
        setSuccess('Category updated successfully');
      } else {
        // Create new category
        await categoryApi.createCategory(formData);
        setSuccess('Category created successfully');
      }

      // Reset form and reload categories
      resetForm();
      await loadCategoriesData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status,
      parentCategoryId: category.parentCategory?.id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      setSuccess('Category deleted successfully');
      await loadCategoriesData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: CATEGORY_STATUS.ACTIVE,
      parentCategoryId: undefined,
    });
    setEditingCategory(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  // Open form for new category
  const openNewCategoryForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadCategories(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadCategories(currentPage + 1);
    }
  };

  // Refresh categories
  const handleRefresh = async () => {
    await loadCategories(currentPage);
    await refreshCategories(); // Also refresh context for dropdowns
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryBar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1zM3 20h4l-4-4v4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                <p className="text-gray-600 mt-1">Organize your marketplace with categories and subcategories</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={openNewCategoryForm}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              <HiPlus className="w-5 h-5" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search Row */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              <HiSearch className="w-5 h-5" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={showFilters ? { backgroundColor: '#7c3aed', color: 'white' } : { backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              <HiFilter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            {(searchTerm || Object.values(filters).some(value => value !== '' && value !== undefined)) && (
              <button
                onClick={() => {
                  clearSearch();
                  clearFilters();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                <HiX className="w-5 h-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 bg-white" style={{ backgroundColor: 'white' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white" style={{ backgroundColor: 'white' }}>
                {/* Status Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      status: e.target.value || undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                {/* Parent Category Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Parent Category
                  </label>
                  <select
                    value={filters.parentId || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      parentId: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="0">Top-level only</option>
                    {parentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Name Contains
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleApplyFilters}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  style={{ backgroundColor: '#16a34a', color: 'white' }}
                >
                  <HiSearch className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  style={{ backgroundColor: '#4b5563', color: 'white' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(Object.values(filters).some(value => value !== '' && value !== undefined) || searchTerm) && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.parentId !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Parent: {filters.parentId === 0 ? 'Top-level only' : parentCategories.find(c => c.id === filters.parentId)?.name || 'Unknown'}
                    </span>
                  )}
                  {filters.name && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Name: "{filters.name}"
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  clearSearch();
                  clearFilters();
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-800 font-medium">✅ {success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          </div>
        )}

        {/* Category Form - Inline on Page */}
        {showForm && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Form Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editingCategory ? 'Update category details below' : 'Fill in the details to create a new category'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  style={{ backgroundColor: 'transparent', color: '#9ca3af' }}
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., Electronics, Fashion, Books..."
                        required
                      />
                    </div>

                    {/* Parent Category Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Category
                      </label>
                      <select
                        key={`parent-select-${showForm}-${editingCategory?.id || 'new'}`}
                        value={formData.parentCategoryId || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        autoComplete="off"
                        name="parentCategory"
                      >
                        <option value="">No parent (Top-level category)</option>
                        {/* Show only parent categories for selection */}
                        {parentCategories
                          .filter(cat => cat.id !== editingCategory?.id)
                          .map(category => (
                            <option key={`parent-${category.id}`} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Brief description of this category (optional)..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value={CATEGORY_STATUS.ACTIVE}>Active</option>
                        <option value={CATEGORY_STATUS.INACTIVE}>Inactive</option>
                        <option value={CATEGORY_STATUS.DRAFT}>Draft</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-end">
                      <div className="flex space-x-3 w-full">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                          style={{ backgroundColor: '#3b82f6', color: 'white' }}
                        >
                          {editingCategory ? 'Update Category' : 'Create Category'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:border-gray-400 transition-colors font-medium"
                          style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Pagination at Top */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200" style={{ backgroundColor: 'white' }}>
              <div className="text-sm text-gray-700" style={{ color: '#374151' }}>
                Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
              </div>

              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  style={{ backgroundColor: 'transparent', color: '#6b7280' }}
                  title="Refresh categories"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* Simple Pagination */}
                <div className="flex items-center" style={{ backgroundColor: 'transparent' }}>
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className={`p-1 ${
                      currentPage === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: currentPage === 0 ? '#d1d5db' : '#6b7280'
                    }}
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Current Page */}
                  <span className="px-2 text-sm text-gray-600" style={{ backgroundColor: 'transparent', color: '#4b5563' }}>
                    {currentPage + 1}
                  </span>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className={`p-1 ${
                      currentPage >= totalPages - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: currentPage >= totalPages - 1 ? '#d1d5db' : '#6b7280'
                    }}
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Start organizing your marketplace by creating your first product category. Categories help customers find products easily.</p>
              <button
                onClick={openNewCategoryForm}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#2563eb', color: 'white' }}
              >
                <HiPlus className="w-5 h-5" />
                <span>Create Your First Category</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(category => (
                    <React.Fragment key={category.id}>
                      {/* Category Row */}
                      <tr className="hover:bg-gray-50 transition-colors bg-white">
                        {/* Category Name with Expand Button */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => {
                                if (expandedCategories.has(category.id)) {
                                  toggleCategoryExpansion(category.id);
                                } else {
                                  loadChildCategories(category.id);
                                }
                              }}
                              className="p-2 transition-colors"
                              style={{ backgroundColor: 'transparent', color: '#3b82f6' }}
                              title={expandedCategories.has(category.id) ? 'Collapse subcategories' : 'Expand subcategories'}
                              disabled={loadingChildren.has(category.id)}
                            >
                              {loadingChildren.has(category.id) ? (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <HiChevronRight 
                                  className={`w-4 h-4 text-blue-500 transition-all duration-200 ${
                                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                                  }`} 
                                />
                              )}
                            </button>
                            
                            {/* Category Icon */}
                            <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-100 to-purple-100">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                              </svg>
                            </div>
                            
                            {/* Category Name */}
                            <span className="font-semibold text-gray-900 text-sm">
                              {category.name}
                            </span>
                            
                            {/* Child Count Badge */}
                            {childCategories[category.id] && childCategories[category.id].length > 0 && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                {childCategories[category.id].length}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="text-blue-600 font-medium text-xs">
                            {category.parentCategory ? `Child of ${category.parentCategory.name}` : 'Parent Category'}
                          </span>
                        </td>
                        
                        {/* Description */}
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <div className="truncate" title={category.description || ''}>
                            {category.description || (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            category.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-700' 
                              : category.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {category.status === 'ACTIVE' ? 'Active' : 
                             category.status === 'INACTIVE' ? 'Inactive' : 'Draft'}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                              style={{ backgroundColor: 'transparent', color: '#3b82f6' }}
                              title="Edit category"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.name)}
                              className="p-2 text-red-500 hover:text-red-600 transition-colors"
                              style={{ backgroundColor: 'transparent', color: '#dc2626' }}
                              title="Delete category"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Child Categories (shown when expanded) */}
                      {expandedCategories.has(category.id) && childCategories[category.id] && 
                        childCategories[category.id].map(childCategory => (
                          <tr key={childCategory.id} className="hover:bg-blue-50/30 transition-colors bg-blue-50/20">
                            {/* Child Category Name with Indentation */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-3 ml-8">
                                {/* Child Indicator */}
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-px bg-gray-300"></div>
                                  <div className="w-2 h-px bg-gray-400"></div>
                                </div>
                                
                                {/* Category Icon */}
                                <div className="p-1.5 rounded-md bg-gray-100">
                                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                                  </svg>
                                </div>
                                
                                {/* Category Name */}
                                <span className="font-medium text-gray-900 text-sm">
                                  {childCategory.name}
                                </span>
                              </div>
                            </td>
                            
                            {/* Type */}
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                Child of {category.name}
                              </span>
                            </td>
                            
                            {/* Description */}
                            <td className="px-6 py-3 text-sm text-gray-600 max-w-xs">
                              <div className="truncate" title={childCategory.description || ''}>
                                {childCategory.description || (
                                  <span className="text-gray-400 italic">No description</span>
                                )}
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                childCategory.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-700' 
                                  : childCategory.status === 'INACTIVE'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {childCategory.status === 'ACTIVE' ? 'Active' : 
                                 childCategory.status === 'INACTIVE' ? 'Inactive' : 'Draft'}
                              </span>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEdit(childCategory)}
                                  className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                                  style={{ backgroundColor: 'transparent', color: '#3b82f6' }}
                                  title="Edit category"
                                >
                                  <HiPencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(childCategory.id, childCategory.name)}
                                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                                  style={{ backgroundColor: 'transparent', color: '#dc2626' }}
                                  title="Delete category"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
