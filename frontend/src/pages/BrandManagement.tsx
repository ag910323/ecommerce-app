import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiChevronLeft, HiChevronRight, HiPhotograph, HiFilter, HiX, HiChevronDown, HiTag, HiDocumentText } from 'react-icons/hi';
import { brandApi, type BrandResponse, type BrandRequest, type BrandFilterRequest } from '../api/brandApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Header from './Header';
import CategoryBar from './CategoryBar';

export default function BrandManagement() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // State management
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<BrandRequest>({
    name: '',
    description: '',
    logo: '',
    partnershipLevel: 'NONE',
    partnershipBadge: '',
    partnershipPriority: 0
  });

  // Partnership types state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BrandFilterRequest>({
    name: '',
    description: '',
    partnershipLevel: undefined,
    hasLogo: undefined,
    isPartner: undefined,
    partnershipBadge: ''
  });
  
  // Ref to track if initial load is done
  const hasLoadedRef = useRef(false);

  // Load brands with pagination and filters
  const loadBrands = useCallback(async (page: number, useFilters: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading brands for admin user:', user?.roleNames);
      console.log('Token exists:', !!localStorage.getItem('token'));
      
      let response;
      
      if (useFilters || Object.values(filters).some(value => value !== '' && value !== undefined)) {
        // Use filter API
        const filterRequest: BrandFilterRequest = {
          ...filters,
          name: searchTerm || filters.name,
          page,
          size: pageSize,
          sortBy: 'name',
          sortDir: 'asc'
        };
        response = await brandApi.filterBrands(filterRequest);
      } else if (searchTerm.trim()) {
        // Use search API
        response = await brandApi.searchBrands(searchTerm, page, pageSize);
      } else {
        // Use get all API
        response = await brandApi.getAllBrands(page, pageSize);
      }
      
      console.log('Brands loaded successfully:', response);
      setBrands(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to load brands:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 401) {
        setError('Please log in to access brand management.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to manage brands. Admin access required.');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to load brands';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageSize, filters]); // Dependencies for useCallback

  // Load brands on component mount
  useEffect(() => {
    if (user?.roleNames?.includes('ADMIN') && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBrands(0);
    }
  }, [user, loadBrands]); // Dependencies: user and loadBrands

  // Load partnership types

  // Search brands
  const handleSearch = () => {
    setCurrentPage(0);
    loadBrands(0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    loadBrands(0);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(0);
    loadBrands(0, true);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      name: '',
      description: '',
      partnershipLevel: undefined,
      hasLogo: undefined,
      isPartner: undefined,
      partnershipBadge: ''
    });
    setCurrentPage(0);
    loadBrands(0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      if (editingBrand) {
        // Update existing brand
        await brandApi.updateBrand(editingBrand.id, formData);
        setSuccess('Brand updated successfully');
        addNotification({
          type: 'success',
          title: 'Brand Updated',
          message: `${formData.name} has been updated successfully`
        });
      } else {
        // Create new brand
        await brandApi.createBrand(formData);
        setSuccess('Brand created successfully');
        addNotification({
          type: 'success',
          title: 'Brand Created',
          message: `${formData.name} has been added to the system`
        });
      }

      // Reset form and reload brands
      resetForm();
      await loadBrands(currentPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save brand';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: errorMessage
      });
    }
  };

  // Handle edit
  const handleEdit = (brand: BrandResponse) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      partnershipLevel: brand.partnershipLevel || 'NONE',
      partnershipBadge: brand.partnershipBadge || '',
      partnershipPriority: brand.partnershipPriority || 0
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await brandApi.deleteBrand(id);
      setSuccess('Brand deleted successfully');
      addNotification({
        type: 'success',
        title: 'Brand Deleted',
        message: `${name} has been removed from the system`
      });
      await loadBrands(currentPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete brand';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      partnershipLevel: 'NONE',
      partnershipBadge: '',
      partnershipPriority: 0
    });
    setEditingBrand(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadBrands(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadBrands(currentPage + 1);
    }
  };

  // Check if user is admin
  const isAdmin = user?.roleNames?.includes('ADMIN');

  // Simple dropdown component
  const CustomSelect = ({ value, onChange, options, placeholder }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; icon?: any; color?: string }[];
    placeholder: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative bg-white" ref={dropdownRef} style={{ backgroundColor: 'white' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #9ca3af' }}
        >
          <span className="text-gray-700" style={{ color: '#374151' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <HiChevronDown className={`w-4 h-4 text-gray-600 ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#4B5563' }} />
        </button>

        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            style={{ backgroundColor: 'white', zIndex: 9999 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                style={{ backgroundColor: 'white', color: '#374151' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need administrator privileges to manage brands.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
            <p className="text-gray-600">Manage brands and their partnerships</p>
            {/* Stats Summary */}
            <div className="flex space-x-4 mt-2 text-sm text-gray-500">
              <span>Total: {totalElements}</span>
              <span>•</span>
              <span>Page {currentPage + 1} of {totalPages}</span>
              {brands.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Partners: {brands.filter(b => b.partnershipLevel && b.partnershipLevel !== 'NONE').length}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            style={{ backgroundColor: '#2563eb', color: 'white' }}
          >
            <HiPlus className="w-5 h-5" />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search Row */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 bg-white" style={{ backgroundColor: 'white' }}>
                {/* Partnership Level Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Partnership Level
                  </label>
                  <CustomSelect
                    value={filters.partnershipLevel || ''}
                    onChange={(value) => setFilters({
                      ...filters,
                      partnershipLevel: value ? value as any : undefined
                    })}
                    placeholder="All Levels"
                    options={[
                      { value: '', label: 'All Levels' },
                      { value: 'NONE', label: 'No Partnership' },
                      { value: 'PARTNER', label: 'Brand Partner' },
                      { value: 'FEATURED', label: 'Featured Brand' },
                      { value: 'TOP', label: 'Top Brand' },
                      { value: 'EXCLUSIVE', label: 'Exclusive Partner' }
                    ]}
                  />
                </div>

                {/* Has Logo Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Logo Status
                  </label>
                  <CustomSelect
                    value={filters.hasLogo === undefined ? '' : filters.hasLogo.toString()}
                    onChange={(value) => setFilters({
                      ...filters,
                      hasLogo: value === '' ? undefined : value === 'true'
                    })}
                    placeholder="All Brands"
                    options={[
                      { value: '', label: 'All Brands' },
                      { value: 'true', label: 'Has Logo' },
                      { value: 'false', label: 'No Logo' }
                    ]}
                  />
                </div>

                {/* Partner Status Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Partner Status
                  </label>
                  <CustomSelect
                    value={filters.isPartner === undefined ? '' : filters.isPartner.toString()}
                    onChange={(value) => setFilters({
                      ...filters,
                      isPartner: value === '' ? undefined : value === 'true'
                    })}
                    placeholder="All Brands"
                    options={[
                      { value: '', label: 'All Brands' },
                      { value: 'true', label: 'Partners Only' },
                      { value: 'false', label: 'Non-Partners Only' }
                    ]}
                  />
                </div>

                {/* Description Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Description Contains
                  </label>
                  <div className="relative">
                    <HiDocumentText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search in descriptions..."
                      value={filters.description || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        description: e.target.value
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Partnership Badge Filter */}
                <div className="bg-white" style={{ backgroundColor: 'white' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                    Partnership Badge
                  </label>
                  <div className="relative">
                    <HiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search badge text..."
                      value={filters.partnershipBadge || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        partnershipBadge: e.target.value
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Add/Edit Form - Inline on Page */}
        {showForm && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Form Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <HiPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editingBrand ? 'Update brand details below' : 'Fill in the details to create a new brand'}
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
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., Apple, Nike, Samsung"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partnership Level
                      </label>
                      <select
                        value={formData.partnershipLevel}
                        onChange={(e) => setFormData({ ...formData, partnershipLevel: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="NONE">No Partnership</option>
                        <option value="PARTNER">Brand Partner</option>
                        <option value="FEATURED">Featured Brand</option>
                        <option value="TOP">Top Brand</option>
                        <option value="EXCLUSIVE">Exclusive Partner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Brief description of the brand..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="https://example.com/logo.png"
                      />
                      <div className="flex-shrink-0">
                        {formData.logo ? (
                          <img
                            src={formData.logo}
                            alt="Logo preview"
                            className="w-12 h-12 object-contain bg-gray-100 rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <HiPhotograph className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partnership Information */}
                  {formData.partnershipLevel !== 'NONE' && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Partnership Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partnership Badge
                          </label>
                          <input
                            type="text"
                            value={formData.partnershipBadge}
                            onChange={(e) => setFormData({ ...formData, partnershipBadge: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="e.g., Verified Partner, Premium Brand"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partnership Priority
                          </label>
                          <input
                            type="number"
                            value={formData.partnershipPriority}
                            onChange={(e) => setFormData({ ...formData, partnershipPriority: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                          <p className="text-xs text-gray-500 mt-2">Higher priority brands appear first in search results (0-100)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        style={{ backgroundColor: '#2563eb', color: 'white' }}
                      >
                        {editingBrand ? 'Update Brand' : 'Create Brand'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold"
                        style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

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
                  {filters.partnershipLevel && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Level: {filters.partnershipLevel}
                    </span>
                  )}
                  {filters.hasLogo !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Logo: {filters.hasLogo ? 'With Logo' : 'Without Logo'}
                    </span>
                  )}
                  {filters.isPartner !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Status: {filters.isPartner ? 'Partners Only' : 'Non-Partners Only'}
                    </span>
                  )}
                  {filters.description && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Description: "{filters.description}"
                    </span>
                  )}
                  {filters.partnershipBadge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      Badge: "{filters.partnershipBadge}"
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

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Pagination at Top */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200" style={{ backgroundColor: 'white' }}>
              <div className="text-sm text-gray-700" style={{ color: '#374151' }}>
                Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
              </div>

              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                <button
                  onClick={() => loadBrands(currentPage)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  style={{ backgroundColor: 'transparent', color: '#6b7280' }}
                  title="Refresh current page"
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

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading brands...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchTerm ? 'No brands found matching your search.' : 'No brands found. Add your first brand!'}
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partnership
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {brand.logo ? (
                              <img
                                className="h-10 w-10 object-contain bg-gray-100 rounded border"
                                src={brand.logo}
                                alt={brand.name}
                                onError={(e) => {
                                  e.currentTarget.src = `https://via.placeholder.com/40x40/f3f4f6/6b7280?text=${brand.name.charAt(0)}`;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {brand.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            <div className="text-sm text-gray-500">ID: {brand.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {brand.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {brand.partnershipLevel && brand.partnershipLevel !== 'NONE' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            brand.partnershipLevel === 'EXCLUSIVE' ? 'bg-red-100 text-red-800' :
                            brand.partnershipLevel === 'TOP' ? 'bg-yellow-100 text-yellow-800' :
                            brand.partnershipLevel === 'FEATURED' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {brand.partnershipBadge || brand.partnershipLevel}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="text-blue-600 hover:text-blue-900 p-1 bg-white"
                            title="Edit brand"
                            style={{ backgroundColor: 'white', color: '#2563eb' }}
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id, brand.name)}
                            className="text-red-600 hover:text-red-900 p-1 bg-white"
                            title="Delete brand"
                            style={{ backgroundColor: 'white', color: '#dc2626' }}
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
