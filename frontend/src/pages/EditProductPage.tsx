import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { productApi } from '../api/productApi';
import { brandApi, type BrandResponse } from '../api/brandApi';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { ProductRequest, PartnershipLevel } from '../types';
import { PRODUCT_STATUS } from '../types';
import Header from './Header';
import CategoryBar from './CategoryBar';

export default function EditProductPage() {
  const { parentCategories } = useCategories();
  const { token, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const productId = id ? parseInt(id) : undefined;

  // Form data state (similar to AddProductPage)
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

  const [loading, setLoading] = useState(false); // submit loading
  const [fetching, setFetching] = useState(true); // initial fetch loading
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
  const [variants, setVariants] = useState<Array<any>>([]);

  // State for brands
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Attribute handlers (reuse from AddProductPage)
  const addAttribute = () => setAttributes(prev => [...prev, { key: '', value: '' }]);
  const removeAttribute = (index: number) => setAttributes(prev => prev.filter((_, i) => i !== index));
  const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, [field]: value } : attr));
  };

  // Image URL handlers
  const addImageUrl = () => setImageUrls(prev => [...prev, '']);
  const removeImageUrl = (index: number) => setImageUrls(prev => prev.filter((_, i) => i !== index));
  const updateImageUrl = (index: number, value: string) => setImageUrls(prev => prev.map((url, i) => i === index ? value : url));

  const isValidUrl = (value: string) => {
    if (!value.trim()) return false;
    try { new URL(value); return true; } catch { return false; }
  };

  // Variants handlers (basic reuse)
  const addVariant = () => setVariants(prev => [...prev, { variantName: '', price: 0, stockQuantity: 0, sku: '', images: [''], attributes: [{ key: '', value: '' }] }]);
  const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: string, value: any) => setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  const addVariantImage = (variantIndex: number) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, images: [...variant.images, ''] } : variant));
  const removeVariantImage = (variantIndex: number, imageIndex: number) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, images: variant.images.filter((_, j) => j !== imageIndex) } : variant));
  const updateVariantImage = (variantIndex: number, imageIndex: number, value: string) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, images: variant.images.map((img, j) => j === imageIndex ? value : img) } : variant));
  const addVariantAttribute = (variantIndex: number) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, attributes: [...variant.attributes, { key: '', value: '' }] } : variant));
  const removeVariantAttribute = (variantIndex: number, attrIndex: number) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, attributes: variant.attributes.filter((_, j) => j !== attrIndex) } : variant));
  const updateVariantAttribute = (variantIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => setVariants(prev => prev.map((variant, i) => i === variantIndex ? { ...variant, attributes: variant.attributes.map((attr: any, j: number) => j === attrIndex ? { ...attr, [field]: value } : attr) } : variant));

  // Step navigation reused
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.sku?.trim() || formData.price <= 0 || !formData.categoryId) {
        setError('Please fill in all required fields: Name, SKU, Price, and Category');
        return;
      }
    }
    if (currentStep === 3) {
      const validVariants = variants.filter(v => v.variantName?.trim() || v.price > 0 || v.stockQuantity > 0);
      if (validVariants.length > 0) {
        for (let i = 0; i < validVariants.length; i++) {
          const variant = validVariants[i];
          if (!variant.variantName.trim()) { setError(`Variant ${i + 1}: Variant name is required`); return; }
          if (variant.price <= 0) { setError(`Variant ${i + 1}: Price must be greater than 0`); return; }
          if (variant.stockQuantity < 0) { setError(`Variant ${i + 1}: Stock quantity cannot be negative`); return; }
        }
      }
    }
    setError('');
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else await handleSubmit();
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandApi.getPublicBrands(0, 100);
        setBrands(response.content);
      } catch (err) {
        console.error('Failed to load brands', err);
      } finally { setBrandsLoading(false); }
    };
    fetchBrands();
  }, []);

  // Load existing product
  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      try {
        setFetching(true);
        const resp = await api.get(`/api/products/${productId}`);
        const product = resp.data?.data;
        if (!product) throw new Error('Product not found');

        // Map product response into local form state
        setFormData(prev => ({
          ...prev,
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          sku: product.sku || '',
          brandId: product.brandId,
          brandName: product.brandName || product.brand || '',
          categoryId: product.categoryId || 0,
          stockQuantity: product.stockQuantity || 0,
          status: product.status || PRODUCT_STATUS.ACTIVE,
          rating: product.rating || 0,
          discountPercentage: product.discountPercentage || 0,
          imageUrls: product.imageUrls || [],
          attributes: product.attributes || {},
          isSponsored: !!product.isSponsored,
          sponsorPriority: product.sponsorPriority || 0,
          sponsorStartDate: product.sponsorStartDate || '',
          sponsorEndDate: product.sponsorEndDate || '',
          sponsorBudget: product.sponsorBudget || 0,
          sponsorCostPerClick: product.sponsorCostPerClick || 0,
          partnershipBadge: product.partnershipBadge || '',
          partnershipPriority: product.partnershipPriority || 0,
          brandPartnershipLevel: product.brandPartnershipLevel || 'NONE'
        }));

        // Attributes array
        const attrs = product.attributes ? Object.entries(product.attributes).map(([k, v]) => ({ key: k, value: String(v) })) : [{ key: '', value: '' }];
        setAttributes(attrs.length ? attrs : [{ key: '', value: '' }]);

        // Images
        setImageUrls((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : ['']);

        // Variants
        const mappedVariants = (product.variants || []).map((v: any) => ({
          variantName: v.variantName || '',
          price: v.price || 0,
          stockQuantity: v.stockQuantity || 0,
          sku: v.sku || '',
          images: v.images && v.images.length ? v.images : [''],
          attributes: v.attributes ? Object.entries(v.attributes).map(([k, val]) => ({ key: k, value: String(val) })) : [{ key: '', value: '' }]
        }));
        setVariants(mappedVariants.length ? mappedVariants : []);
      } catch (err: any) {
        console.error('Failed to load product:', err);
        addNotification({ type: 'error', title: 'Load Failed', message: err?.response?.data?.message || err.message || 'Failed to load product' });
        navigate('/seller/products');
      } finally { setFetching(false); }
    };
    load();
  }, [productId]);

  // Validation
  const validateForm = (): boolean => {
    if (!formData.name.trim()) { setError('Product name is required'); return false; }
    if (!formData.sku?.trim()) { setError('SKU is required'); return false; }
    if (formData.price <= 0) { setError('Price must be greater than 0'); return false; }
    if ((formData.stockQuantity ?? 0) < 0) { setError('Stock quantity cannot be negative'); return false; }
    if (!formData.categoryId || formData.categoryId === 0) { setError('Please select a category'); return false; }
    const validVariants = variants.filter(v => v.variantName?.trim() || v.price > 0 || v.stockQuantity > 0);
    for (let i = 0; i < validVariants.length; i++) {
      const variant = validVariants[i];
      if (!variant.variantName.trim()) { setError(`Variant ${i + 1}: Variant name is required`); return false; }
      if (variant.price <= 0) { setError(`Variant ${i + 1}: Price must be greater than 0`); return false; }
      if (variant.stockQuantity < 0) { setError(`Variant ${i + 1}: Stock quantity cannot be negative`); return false; }
      const imageUrls = variant.images?.filter((u: string) => u.trim()) || [];
      for (let j = 0; j < imageUrls.length; j++) { if (!isValidUrl(imageUrls[j])) { setError(`Variant ${i + 1}: Image ${j + 1} must be a valid URL`); return false; } }
    }
    return true;
  };

  // Submit handler (update)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productId) return;
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const attributesObject = attributes.reduce((acc, attr) => { if (attr.key.trim() && attr.value.trim()) acc[attr.key.trim()] = attr.value.trim(); return acc; }, {} as Record<string, string>);
      const validImageUrls = imageUrls.filter(url => url.trim());
      const validVariants = variants.filter(v => v.variantName?.trim() || v.price > 0 || v.stockQuantity > 0);
      const processedVariants = validVariants.map(v => ({
        variantName: v.variantName,
        attributes: v.attributes ? v.attributes.reduce((acc: any, a: any) => { if (a.key.trim() && a.value.trim()) acc[a.key.trim()] = a.value.trim(); return acc; }, {}) : {},
        price: v.price,
        stockQuantity: v.stockQuantity,
        sku: v.sku,
        images: v.images?.filter((u: string) => u.trim()) || []
      }));

      const productData: Partial<ProductRequest> = {
        ...formData,
        sellerId: user?.sellerResponse?.id || formData.sellerId,
        attributes: attributesObject,
        imageUrls: validImageUrls,
        variants: processedVariants
      };

      await productApi.updateProduct(productId, productData);

      addNotification({ type: 'success', title: 'Product Updated', message: `${formData.name} has been updated` });
      navigate('/seller/products');
    } catch (err: any) {
      console.error('Update failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
      setError(errorMessage);
      addNotification({ type: 'error', title: 'Update Failed', message: errorMessage });
    } finally { setLoading(false); }
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
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You need to be logged in as a seller to edit products.</p>
            <a href="/login" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <span>Login to Continue</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryBar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5l4 4L12 16l-4 1 1-4 8.5-8.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product details and save changes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-6">
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

            {/* Step indicator reuses AddProductPage layout */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Edit Wizard</h2>
                <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step < currentStep ? 'bg-green-500 text-white' : step === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {step < currentStep ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step}
                    </div>
                    {step < totalSteps && (<div className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />)}
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

            {/* Render steps: reuse same fields as AddProductPage - for brevity reuse minimal fields here */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input type="number" min="0" step="0.01" value={formData.price || ''} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input type="number" min="0" value={formData.stockQuantity || ''} onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select value={formData.categoryId || ''} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select a category</option>
                    {parentCategories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select value={formData.brandId || ''} onChange={(e) => { const bid = parseInt(e.target.value)||undefined; const b = brands.find(bb=>bb.id===bid); setFormData(prev=>({ ...prev, brandId: bid, brandName: b?.name||'' })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={brandsLoading}>
                    <option value="">{brandsLoading ? 'Loading brands...' : 'Select a brand (optional)'}</option>
                    {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="space-y-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input type="url" value={url} onChange={(e) => updateImageUrl(idx, e.target.value)} placeholder="Enter image URL" className={`flex-1 px-3 py-2 border rounded-lg ${url && !isValidUrl(url) ? 'border-red-300' : 'border-gray-300'}`} />
                        <button type="button" onClick={() => removeImageUrl(idx)} className="p-2 text-red-600" disabled={imageUrls.length===1}>Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={addImageUrl} className="mt-2 px-3 py-2 border rounded-lg">Add Image URL</button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variants</label>
                  <div className="space-y-4">
                    {variants.map((variant, vi) => (
                      <div key={vi} className="border p-4 rounded-lg">
                        <input type="text" value={variant.variantName} onChange={(e) => updateVariant(vi, 'variantName', e.target.value)} placeholder="Variant name" className="w-full px-3 py-2 border rounded-lg mb-2" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" min="0" step="0.01" value={variant.price||''} onChange={(e)=>updateVariant(vi,'price',parseFloat(e.target.value)||0)} className="px-3 py-2 border rounded-lg" placeholder="Price" />
                          <input type="number" min="0" value={variant.stockQuantity||''} onChange={(e)=>updateVariant(vi,'stockQuantity',parseInt(e.target.value)||0)} className="px-3 py-2 border rounded-lg" placeholder="Stock" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addVariant} className="mt-2 px-3 py-2 border rounded-lg">Add Variant</button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attributes</label>
                  <div className="space-y-2">
                    {attributes.map((attr, ai) => (
                      <div key={ai} className="flex items-center space-x-2">
                        <input type="text" value={attr.key} onChange={(e) => updateAttribute(ai, 'key', e.target.value)} placeholder="Attribute name" className="flex-1 px-3 py-2 border rounded-lg" />
                        <input type="text" value={attr.value} onChange={(e) => updateAttribute(ai, 'value', e.target.value)} placeholder="Attribute value" className="flex-1 px-3 py-2 border rounded-lg" />
                      </div>
                    ))}
                    <button type="button" onClick={addAttribute} className="mt-2 px-3 py-2 border rounded-lg">Add Attribute</button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sponsorship</label>
                  <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" checked={formData.isSponsored||false} onChange={(e)=>setFormData(prev=>({...prev,isSponsored:e.target.checked}))} className="mr-2"/> Mark as sponsored</label>
                    <input type="number" value={formData.sponsorPriority||''} onChange={(e)=>setFormData(prev=>({...prev,sponsorPriority:parseInt(e.target.value)||0}))} className="px-3 py-2 border rounded-lg" placeholder="Sponsor Priority" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm">Name: {formData.name}</p>
                  <p className="text-sm">SKU: {formData.sku}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={handleBack} disabled={currentStep===1} className="px-6 py-2 border rounded-lg">Back</button>
              <button type="button" onClick={handleNext} disabled={loading} className={`px-6 py-2 rounded-lg ${currentStep===5? 'bg-green-600 text-white':'bg-blue-600 text-white'}`}>
                {currentStep===5 ? (loading ? 'Saving...' : 'Save Changes') : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
