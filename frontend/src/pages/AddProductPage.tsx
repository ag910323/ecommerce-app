import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { brandApi, type BrandResponse } from '../api/brandApi';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { ProductRequest, PartnershipLevel } from '../types';
import { PRODUCT_STATUS } from '../types';
import Header from './Header';
import CategoryBar from './CategoryBar';

export default function AddProductPage() {
  const { parentCategories } = useCategories();
  const { token, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    sku: '',
    brandId: undefined,
    brandName: '',
    categoryId: 0,
    sellerId: user?.sellerResponse?.id || 1,
    stockQuantity: 0,
    status: PRODUCT_STATUS.ACTIVE,
    rating: 0,
    discountPercentage: 0,
    imageUrls: [],
    attributes: {},
    isSponsored: false,
    sponsorPriority: 0,
    sponsorStartDate: '',
    sponsorEndDate: '',
    sponsorBudget: 0,
    sponsorCostPerClick: 0,
    partnershipBadge: '',
    partnershipPriority: 0,
    brandPartnershipLevel: 'NONE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    sponsorship: false,
    brand: false,
    attributes: false,
    images: false,
    variants: false
  });

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // State for dynamic attributes
  const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);

  // State for image URLs
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // State for product variants
  const [variants, setVariants] = useState<Array<{
    variantName: string;
    price: number;
    stockQuantity: number;
    sku: string;
    images: string[];
    attributes: Array<{ key: string; value: string }>;
  }>>([]);

  // State for brands
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Attribute handlers
  const addAttribute = () => {
    setAttributes(prev => [...prev, { key: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    setAttributes(prev => prev.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    ));
  };

  // Image URL handlers
  const addImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const isValidUrl = (value: string) => {
    if (!value.trim()) {
      return false;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  // Variant handlers
  const addVariant = () => {
    setVariants(prev => [...prev, {
      variantName: '',
      price: 0,
      stockQuantity: 0,
      sku: '',
      images: [''],
      attributes: [{ key: '', value: '' }]
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof typeof variants[0], value: any) => {
    setVariants(prev => prev.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addVariantImage = (variantIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, images: [...variant.images, ''] }
        : variant
    ));
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, images: variant.images.filter((_, j) => j !== imageIndex) }
        : variant
    ));
  };

  const updateVariantImage = (variantIndex: number, imageIndex: number, value: string) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? {
            ...variant,
            images: variant.images.map((image, j) => j === imageIndex ? value : image)
          }
        : variant
    ));
  };

  const addVariantAttribute = (variantIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, attributes: [...variant.attributes, { key: '', value: '' }] }
        : variant
    ));
  };

  const removeVariantAttribute = (variantIndex: number, attrIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, attributes: variant.attributes.filter((_, j) => j !== attrIndex) }
        : variant
    ));
  };

  const updateVariantAttribute = (variantIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? {
            ...variant,
            attributes: variant.attributes.map((attr, j) =>
              j === attrIndex ? { ...attr, [field]: value } : attr
            )
          }
        : variant
    ));
  };

  // Step navigation handlers
  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate basic fields
      if (!formData.name.trim() || !formData.sku?.trim() || formData.price <= 0 || !formData.categoryId) {
        setError('Please fill in all required fields: Name, SKU, Price, and Category');
        return;
      }
    }
    if (currentStep === 3) {
      // Filter valid variants (those with at least one filled field)
      const validVariants = variants.filter(v =>
        v.variantName.trim() || v.price > 0 || v.stockQuantity > 0
      );

      // Validate only if there are valid variants
      if (validVariants.length > 0) {
        for (let i = 0; i < validVariants.length; i++) {
          const variant = validVariants[i];
          if (!variant.variantName.trim()) {
            setError(`Variant ${i + 1}: Variant name is required`);
            return;
          }
          if (variant.price <= 0) {
            setError(`Variant ${i + 1}: Price must be greater than 0`);
            return;
          }
          if (variant.stockQuantity < 0) {
            setError(`Variant ${i + 1}: Stock quantity cannot be negative`);
            return;
          }
        }
      }
      // If no valid variants, allow proceeding (backend will create default variant)
    }
    setError(''); // Clear any previous errors
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandApi.getPublicBrands(0, 100);
        setBrands(response.content);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Validation function
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.sku?.trim()) {
      setError('SKU is required');
      return false;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if ((formData.stockQuantity ?? 0) < 0) {
      setError('Stock quantity cannot be negative');
      return false;
    }
    if (!formData.categoryId || formData.categoryId === 0) {
      setError('Please select a category');
      return false;
    }

    // Validate variants - filter out empty ones first
    const validVariants = variants.filter(v =>
      v.variantName.trim() || v.price > 0 || v.stockQuantity > 0
    );

    for (let i = 0; i < validVariants.length; i++) {
      const variant = validVariants[i];
      if (!variant.variantName.trim()) {
        setError(`Variant ${i + 1}: Variant name is required`);
        return false;
      }
      if (variant.price <= 0) {
        setError(`Variant ${i + 1}: Price must be greater than 0`);
        return false;
      }
      if (variant.stockQuantity < 0) {
        setError(`Variant ${i + 1}: Stock quantity cannot be negative`);
        return false;
      }

      const imageUrls = variant.images?.filter(url => url.trim()) || [];
      for (let j = 0; j < imageUrls.length; j++) {
        if (!isValidUrl(imageUrls[j])) {
          setError(`Variant ${i + 1}: Image ${j + 1} must be a valid URL`);
          return false;
        }
      }
    }

    return true;
  };

  // Form handling functions
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert attributes array to object
      const attributesObject = attributes.reduce((acc, attr) => {
        if (attr.key.trim() && attr.value.trim()) {
          acc[attr.key.trim()] = attr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      // Filter out empty image URLs
      const validImageUrls = imageUrls.filter(url => url.trim());

      // Convert variants with their attributes - filter out empty variants first
      const validVariants = variants.filter(v =>
        v.variantName.trim() || v.price > 0 || v.stockQuantity > 0
      );

      const processedVariants = validVariants.map(variant => {
        const variantAttributesObject = variant.attributes.reduce((acc, attr) => {
          if (attr.key.trim() && attr.value.trim()) {
            acc[attr.key.trim()] = attr.value.trim();
          }
          return acc;
        }, {} as Record<string, string>);

        return {
          variantName: variant.variantName,
          attributes: variantAttributesObject,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          sku: variant.sku,
          images: variant.images?.filter(url => url.trim()) || []
        };
      });

      let productData = {
        ...formData,
        sellerId: user?.sellerResponse?.id || formData.sellerId,
        attributes: attributesObject,
        imageUrls: validImageUrls,
        variants: processedVariants
      };

      await productApi.createProduct(productData);

      addNotification({
        type: 'success',
        title: 'Product Created',
        message: `${productData.name} has been added to your inventory`
      });

      navigate('/seller/products');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create product';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
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
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You need to be logged in as a seller to add products.</p>
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product for your marketplace inventory</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Creation Wizard</h2>
                <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step < currentStep
                          ? 'bg-green-500 text-white'
                          : step === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step < currentStep ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    {step < totalSteps && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Basic Info</span>
                <span>Product Images</span>
                <span>Variants</span>
                <span>Additional Details</span>
                <span>Review & Submit</span>
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    id="sku"
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                {/* Price and Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stockQuantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discountPercentage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {parentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    id="brand"
                    value={formData.brandId || ''}
                    onChange={(e) => {
                      const selectedBrandId = parseInt(e.target.value) || undefined;
                      const selectedBrand = brands.find(b => b.id === selectedBrandId);
                      setFormData(prev => ({
                        ...prev,
                        brandId: selectedBrandId,
                        brandName: selectedBrand?.name || ''
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={brandsLoading}
                  >
                    <option value="">
                      {brandsLoading ? 'Loading brands...' : 'Select a brand (optional)'}
                    </option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product description (optional)"
                  />
                </div>
              </>
            )}

            {/* Step 2: Product Images */}
            {currentStep === 2 && (
              <>
                {/* Product Images Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('images')}
                    className="w-full flex items-center justify-between p-4 text-left !bg-white hover:!bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Product Images</h3>
                        <p className="text-sm text-gray-500">Add images for your product</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.images ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.images && (
                    <div className="px-4 pb-4 space-y-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            placeholder="Enter image URL"
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              url && !isValidUrl(url) ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={imageUrls.length === 1}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Image URL</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Variants */}
            {currentStep === 3 && (
              <>
                {/* Variants Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('variants')}
                    className="w-full flex items-center justify-between p-4 text-left !bg-white hover:!bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Product Variants</h3>
                        <p className="text-sm text-gray-500">Add different variations of your product</p>
                        <p className="text-xs text-gray-400 mt-1">Optional: If no variants are added, a default variant will be created automatically.</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.variants ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.variants && (
                    <div className="px-4 pb-4 space-y-6">
                      {variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Variant {variantIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeVariant(variantIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Variant Name */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Variant Name
                            </label>
                            <input
                              type="text"
                              value={variant.variantName}
                              onChange={(e) => updateVariant(variantIndex, 'variantName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Red Large"
                            />
                          </div>

                          {/* Variant Price and Stock */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price || ''}
                                onChange={(e) => updateVariant(variantIndex, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={variant.stockQuantity || ''}
                                onChange={(e) => updateVariant(variantIndex, 'stockQuantity', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Variant SKU */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Variant SKU"
                            />
                          </div>

                          {/* Variant Images */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Images
                            </label>
                            <div className="space-y-2">
                              {variant.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="flex items-center space-x-2">
                                  <input
                                    type="url"
                                    value={image}
                                    onChange={(e) => updateVariantImage(variantIndex, imageIndex, e.target.value)}
                                    placeholder="Enter image URL"
                                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      image && !isValidUrl(image) ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    disabled={variant.images.length === 1}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addVariantImage(variantIndex)}
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Image URL</span>
                              </button>
                            </div>
                          </div>

                          {/* Variant Attributes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Attributes
                            </label>
                            <div className="space-y-2">
                              {variant.attributes.map((attr, attrIndex) => (
                                <div key={attrIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={attr.key}
                                    onChange={(e) => updateVariantAttribute(variantIndex, attrIndex, 'key', e.target.value)}
                                    placeholder="Attribute name"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <input
                                    type="text"
                                    value={attr.value}
                                    onChange={(e) => updateVariantAttribute(variantIndex, attrIndex, 'value', e.target.value)}
                                    placeholder="Attribute value"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariantAttribute(variantIndex, attrIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    disabled={variant.attributes.length === 1}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addVariantAttribute(variantIndex)}
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Attribute</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Hint for empty variant */}
                      {variants.length === 1 && !variants[0].variantName.trim() && variants[0].price <= 0 && variants[0].stockQuantity <= 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-800">
                                Remove this empty variant or fill in the details to proceed.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={addVariant}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Variant</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <>
                {/* Attributes Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('attributes')}
                    className="w-full flex items-center justify-between p-4 text-left !bg-white hover:!bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Product Attributes</h3>
                        <p className="text-sm text-gray-500">Add specifications and features</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.attributes ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.attributes && (
                    <div className="px-4 pb-4 space-y-4">
                      {attributes.map((attr, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={attr.key}
                            onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                            placeholder="Attribute name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            placeholder="Attribute value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={attributes.length === 1}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Attribute</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sponsorship Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('sponsorship')}
                    className="w-full flex items-center justify-between p-4 text-left !bg-white hover:!bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Sponsorship Settings</h3>
                        <p className="text-sm text-gray-500">Configure product sponsorship and advertising</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.sponsorship ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.sponsorship && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Is Sponsored */}
                      <div className="flex items-center">
                        <input
                          id="isSponsored"
                          type="checkbox"
                          checked={formData.isSponsored || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isSponsored: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isSponsored" className="ml-2 block text-sm text-gray-900">
                          Mark as sponsored product
                        </label>
                      </div>

                      {/* Sponsor Priority */}
                      <div>
                        <label htmlFor="sponsorPriority" className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsor Priority
                        </label>
                        <input
                          id="sponsorPriority"
                          type="number"
                          min="0"
                          value={formData.sponsorPriority || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sponsorPriority: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="sponsorStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            id="sponsorStartDate"
                            type="datetime-local"
                            value={formData.sponsorStartDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sponsorStartDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="sponsorEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            id="sponsorEndDate"
                            type="datetime-local"
                            value={formData.sponsorEndDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sponsorEndDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Budget and CPC */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="sponsorBudget" className="block text-sm font-medium text-gray-700 mb-2">
                            Budget
                          </label>
                          <input
                            id="sponsorBudget"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.sponsorBudget || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sponsorBudget: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label htmlFor="sponsorCostPerClick" className="block text-sm font-medium text-gray-700 mb-2">
                            Cost per Click
                          </label>
                          <input
                            id="sponsorCostPerClick"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.sponsorCostPerClick || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sponsorCostPerClick: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Partnership Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('brand')}
                    className="w-full flex items-center justify-between p-4 text-left !bg-white hover:!bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Brand Partnership</h3>
                        <p className="text-sm text-gray-500">Configure brand partnership settings</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.brand && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Partnership Badge */}
                      <div>
                        <label htmlFor="partnershipBadge" className="block text-sm font-medium text-gray-700 mb-2">
                          Partnership Badge
                        </label>
                        <input
                          id="partnershipBadge"
                          type="text"
                          value={formData.partnershipBadge || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, partnershipBadge: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Premium Partner"
                        />
                      </div>

                      {/* Partnership Priority */}
                      <div>
                        <label htmlFor="partnershipPriority" className="block text-sm font-medium text-gray-700 mb-2">
                          Partnership Priority
                        </label>
                        <input
                          id="partnershipPriority"
                          type="number"
                          min="0"
                          value={formData.partnershipPriority || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, partnershipPriority: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Brand Partnership Level */}
                      <div>
                        <label htmlFor="brandPartnershipLevel" className="block text-sm font-medium text-gray-700 mb-2">
                          Partnership Level
                        </label>
                        <select
                          id="brandPartnershipLevel"
                          value={formData.brandPartnershipLevel || 'NONE'}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandPartnershipLevel: e.target.value as PartnershipLevel }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="NONE">None</option>
                          <option value="PARTNER">Partner</option>
                          <option value="FEATURED">Featured</option>
                          <option value="TOP">Top</option>
                          <option value="EXCLUSIVE">Exclusive</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <>
                {/* Review Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Product</h3>

                  <div className="space-y-6">
                    {/* Basic Info Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="text-sm text-gray-900">{formData.name || 'Not specified'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">SKU</dt>
                            <dd className="text-sm text-gray-900">{formData.sku || 'Not specified'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Price</dt>
                            <dd className="text-sm text-gray-900">${formData.price || 0}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Stock</dt>
                            <dd className="text-sm text-gray-900">{formData.stockQuantity || 0}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Category</dt>
                            <dd className="text-sm text-gray-900">
                              {parentCategories.find(c => c.id === formData.categoryId)?.name || 'Not selected'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Brand</dt>
                            <dd className="text-sm text-gray-900">{formData.brandName || 'Not selected'}</dd>
                          </div>
                        </dl>
                        {formData.description && (
                          <div className="mt-4">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="text-sm text-gray-900 mt-1">{formData.description}</dd>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Images Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Product Images</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-900">
                          {imageUrls.filter(url => url.trim()).length} image URL(s) added
                        </p>
                      </div>
                    </div>

                    {/* Variants Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Product Variants</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-900">
                          {variants.length} variant(s) configured
                        </p>
                        {variants.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {variants.map((variant, index) => (
                              <div key={index} className="text-xs text-gray-600 border-t pt-2">
                                <strong>{variant.variantName || `Variant ${index + 1}`}</strong>
                                {variant.price > 0 && ` - $${variant.price}`}
                                {variant.stockQuantity > 0 && ` (${variant.stockQuantity} in stock)`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Details Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Attributes</dt>
                            <dd className="text-sm text-gray-900">
                              {attributes.filter(attr => attr.key.trim() && attr.value.trim()).length} attribute(s) defined
                            </dd>
                          </div>
                          {formData.isSponsored && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Sponsorship</dt>
                              <dd className="text-sm text-gray-900">Enabled</dd>
                            </div>
                          )}
                          {formData.partnershipBadge && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Partnership Badge</dt>
                              <dd className="text-sm text-gray-900">{formData.partnershipBadge}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  currentStep === 5
                    ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentStep === 5 ? (loading ? 'Creating Product...' : 'Create Product') : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
