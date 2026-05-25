import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiCreditCard, HiCash, HiLocationMarker, HiShoppingBag, HiArrowLeft, HiPlus, HiCheck } from 'react-icons/hi';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { cartApi } from '../api/cartApi';
import { addressApi } from '../api/addressApi';
import { productApi } from '../api/productApi';
import { ordersApi, type BuyNowRequest, type OrderPreview } from '../api/ordersApi';
import type { CheckoutRequest } from '../api/cartApi';
import type { Address } from '../types';
import type { ProductResponse } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { addNotification } = useNotification();
  const cartItems = cart?.items ?? [];
  const previewItemsKey = cartItems.map(item => `${item.variantId}:${item.quantity}`).join('|');
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    recipientName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phoneNumber: '',
    addressType: 'HOME' as 'HOME' | 'OFFICE' | 'OTHER',
    landmark: ''
  });
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [addressFormTouched, setAddressFormTouched] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [notes, setNotes] = useState('');
  const [previewOrder, setPreviewOrder] = useState<OrderPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Buy Now state
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<{ productId: number; variantId: number; quantity: number; product?: ProductResponse } | null>(null);

  // Synchronous submission lock to prevent duplicate orders on rapid clicks
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check for buy now item in navigation state (not localStorage)
    const navigationState = location.state as any;
    const buyNowData = navigationState?.buyNowItem;
    
    if (buyNowData) {
      setIsBuyNow(true);
      setBuyNowItem(buyNowData);
      
      // Fetch product details if needed
      const fetchProduct = async () => {
        try {
          const product = await productApi.getProductById(buyNowData.productId);
          setBuyNowItem(prev => prev ? { ...prev, product } : null);
        } catch (error) {
          console.error('Failed to fetch product for buy now:', error);
          addNotification({
            type: 'error',
            title: 'Product Not Found',
            message: 'The product you selected is no longer available.'
          });
          navigate('/');
        }
      };
      fetchProduct();
    } else {
      // No buy now item in navigation state - ensure Buy Now state is reset
      setIsBuyNow(false);
      setBuyNowItem(null);
      
      // Regular cart checkout
      if (!cart || !cart.items || cart.items.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Empty Cart',
          message: 'Your cart is empty. Add items to proceed with checkout.'
        });
        navigate('/cart');
        return;
      }
    }
    
    loadSavedAddresses();
  }, [user, navigate, location.state]);

  const buildCheckoutRequest = (): CheckoutRequest => {
    if (!user) {
      throw new Error('User must be logged in to build checkout request');
    }

    const request: CheckoutRequest = {
      userId: user.id,
      paymentMethod,
      notes: notes.trim() || undefined
    };

    if (useNewAddress) {
      request.deliveryAddress = {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        country: deliveryAddress.country,
        zipCode: deliveryAddress.zipCode
      };
    } else if (selectedAddressId) {
      request.addressId = selectedAddressId;
    }

    if (!isBuyNow && cartItems.length > 0) {
      request.items = cartItems.map(item => ({
        productId: item.variantId,
        quantity: item.quantity
      }));
    }

    return request;
  };

  useEffect(() => {
    if (!user || isBuyNow || cartItems.length === 0) return;
    if (!selectedAddressId && !useNewAddress) return;

    const request = buildCheckoutRequest();
    const fetchPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const preview = await ordersApi.previewOrder(request);
        setPreviewOrder(preview);
      } catch (error: any) {
        console.error('Order preview failed:', error);
        setPreviewError('Unable to calculate preview pricing. Please verify your delivery address.');
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [user, isBuyNow, previewItemsKey, selectedAddressId, useNewAddress, deliveryAddress.street, deliveryAddress.city, deliveryAddress.state, deliveryAddress.zipCode, deliveryAddress.country, paymentMethod, notes]);

  // Helper to build Buy Now request object
  const buildBuyNowRequest = (): BuyNowRequest => {
    if (!user || !buyNowItem) {
      throw new Error('User and buy now item must be set');
    }

    const variantId = buyNowItem.variantId ?? buyNowItem.productId;
    if (!variantId) {
      throw new Error('Unable to proceed. Variant not selected.');
    }

    const request: BuyNowRequest = {
      userId: user.id,
      variantId,
      quantity: buyNowItem.quantity,
      saveAddress: saveNewAddress,
      paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'ONLINE'
    };

    if (useNewAddress) {
      request.address = {
        fullName: deliveryAddress.recipientName,
        phoneNumber: deliveryAddress.phoneNumber,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        country: deliveryAddress.country,
        zipCode: deliveryAddress.zipCode,
        landmark: deliveryAddress.landmark,
        addressType: deliveryAddress.addressType
      };
    } else if (selectedAddressId) {
      request.addressId = selectedAddressId;
    }

    return request;
  };

  // Helper to build Buy Now preview request (includes paymentMethod for backend validation)
  const buildBuyNowPreviewRequest = (): BuyNowRequest => {
    if (!user || !buyNowItem) {
      throw new Error('User and buy now item must be set');
    }

    const variantId = buyNowItem.variantId ?? buyNowItem.productId;
    if (!variantId) {
      throw new Error('Unable to proceed. Variant not selected.');
    }

    const request: BuyNowRequest = {
      userId: user.id,
      variantId,
      quantity: buyNowItem.quantity,
      saveAddress: saveNewAddress,
      paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'ONLINE'
    };

    if (useNewAddress) {
      request.address = {
        fullName: deliveryAddress.recipientName,
        phoneNumber: deliveryAddress.phoneNumber,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        country: deliveryAddress.country,
        zipCode: deliveryAddress.zipCode,
        landmark: deliveryAddress.landmark,
        addressType: deliveryAddress.addressType
      };
    } else if (selectedAddressId) {
      request.addressId = selectedAddressId;
    }

    return request;
  };

  // Handle Buy Now preview
  useEffect(() => {
    if (!user || !isBuyNow || !buyNowItem || !buyNowItem.product) return;
    if (!selectedAddressId && !useNewAddress) return;

    let previewRequest: BuyNowRequest;
    try {
      previewRequest = buildBuyNowPreviewRequest();
    } catch (error: any) {
      setPreviewError(error.message || 'Unable to proceed. Variant not selected.');
      return;
    }

    const fetchPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const preview = await ordersApi.previewBuyNow(previewRequest);
        setPreviewOrder(preview);
      } catch (error: any) {
        console.error('Buy Now preview failed:', error);
        setPreviewError('Unable to calculate preview pricing. Please verify your delivery address.');
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [user, isBuyNow, buyNowItem, selectedAddressId, useNewAddress, deliveryAddress.street, deliveryAddress.city, deliveryAddress.state, deliveryAddress.zipCode, deliveryAddress.country, deliveryAddress.landmark, deliveryAddress.addressType, saveNewAddress, paymentMethod]);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    try {
      let addresses: Address[] = [];
      
      // First try to get addresses from user object (from registration)
      if (user.addresses && user.addresses.length > 0) {
        addresses = user.addresses;
        console.log('Loaded addresses from user profile:', addresses.length);
      } else {
        // Fallback to API call to get latest addresses
        try {
          addresses = await addressApi.getUserAddresses(user.id);
          console.log('Loaded addresses from API:', addresses.length);
        } catch (apiError) {
          console.log('No addresses found in API, user may not have any saved addresses');
          addresses = [];
        }
      }
      
      setSavedAddresses(addresses);
      
      if (addresses.length > 0) {
        // Set default address if exists
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          console.log('Selected default address:', defaultAddress.id);
        } else {
          // If no default, select the first address
          setSelectedAddressId(addresses[0].id);
          console.log('Selected first address as default:', addresses[0].id);
        }
        
        // Don't show new address form if we have saved addresses
        setUseNewAddress(false);
        setShowAddressForm(false);
      } else {
        // If no saved addresses, show new address form
        console.log('No saved addresses found, showing new address form');
        setUseNewAddress(true);
        setShowAddressForm(true);
        setSelectedAddressId(null);
        
        // Pre-fill with user's name if available
        if (user.firstName || user.lastName) {
          setDeliveryAddress(prev => ({
            ...prev,
            recipientName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // If everything fails, show new address form
      setUseNewAddress(true);
      setShowAddressForm(true);
      setSelectedAddressId(null);
      setSavedAddresses([]);
      
      addNotification({
        type: 'info',
        title: 'Address Information',
        message: 'Please enter your delivery address to continue.'
      });
    }
  };

  const validateAddressForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deliveryAddress.recipientName.trim()) {
      newErrors.recipientName = 'Full name is required';
    }

    if (!deliveryAddress.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!deliveryAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!deliveryAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!deliveryAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setAddressFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressFieldChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (addressFormErrors[field]) {
      setAddressFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressFieldBlur = (field: string) => {
    setAddressFormTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur if it has been touched or form has been attempted to submit
    if (hasAttemptedSubmit || addressFormTouched[field]) {
      const newErrors = { ...addressFormErrors };
      
      if (field === 'recipientName' && !deliveryAddress.recipientName.trim()) {
        newErrors.recipientName = 'Full name is required';
      } else if (field === 'phoneNumber' && !deliveryAddress.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (field === 'street' && !deliveryAddress.street.trim()) {
        newErrors.street = 'Street address is required';
      } else if (field === 'city' && !deliveryAddress.city.trim()) {
        newErrors.city = 'City is required';
      } else if (field === 'state' && !deliveryAddress.state.trim()) {
        newErrors.state = 'State is required';
      } else if (field === 'zipCode' && !deliveryAddress.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      } else {
        delete newErrors[field];
      }
      
      setAddressFormErrors(newErrors);
    }
  };

  const handleCheckout = async () => {
    // CRITICAL: Synchronous request lock prevents duplicate orders on rapid clicks/taps/spam
    // This guard executes BEFORE any async operations or state changes
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;

    try {
      if (!user) return;

      // Validate address form if using new address and no saved address selected
      if (useNewAddress && !selectedAddressId) {
        setHasAttemptedSubmit(true);
        const isAddressValid = validateAddressForm();
        if (!isAddressValid) {
          // Scroll to the first error field
          const firstErrorField = Object.keys(addressFormErrors)[0];
          if (firstErrorField) {
            const element = document.getElementById(`address-${firstErrorField}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          return;
        }
      }

      setLoading(true);

      try {
        // Handle Buy Now checkout
        if (isBuyNow && buyNowItem) {
          try {
            // Build fresh buy now request at submit time to ensure payload reflects latest state
            // (not stale state from earlier preview)
            const buyNowRequest = buildBuyNowRequest();

            // Wait for API response
            const order = await ordersApi.buyNow(buyNowRequest);

            // Clear Buy Now state after successful checkout
            setIsBuyNow(false);
            setBuyNowItem(null);
            setPreviewOrder(null);

            // Navigate to order confirmation or orders page
            navigate('/orders', {
              replace: true,
              state: {
                orderConfirmation: true,
                orderNumber: order.orderNumber
              }
            });

            return;
          } catch (error: any) {
            console.error('Buy Now checkout failed:', error);
            addNotification({
              type: 'error',
              title: 'Checkout Failed',
              message: error.response?.data?.message || 'Failed to place order. Please try again.'
            });
            setLoading(false);
            return;
          }
        }

        // Handle regular cart checkout (existing logic)
        let finalDeliveryAddress;

        // Determine which address to use
        if (useNewAddress) {
          // Validate new address
          if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode || !deliveryAddress.recipientName) {
            // Address validation is now handled by inline validation above
            setLoading(false);
            return;
          }

          // Save address to user profile if requested
          if (saveNewAddress) {
            try {
              const newAddressRequest = {
                userId: user.id,
                recipientName: deliveryAddress.recipientName,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                zipCode: deliveryAddress.zipCode,
                country: deliveryAddress.country,
                phoneNumber: deliveryAddress.phoneNumber,
                addressType: deliveryAddress.addressType,
                landmark: deliveryAddress.landmark,
                isDefault: savedAddresses.length === 0 // Set as default if it's the first address
              };

              await addressApi.addAddress(newAddressRequest);

              addNotification({
                type: 'success',
                title: 'Address Saved',
                message: 'Your address has been saved to your profile for future orders.'
              });
            } catch (error) {
              console.error('Failed to save address:', error);
              // Continue with checkout even if address save fails
              addNotification({
                type: 'warning',
                title: 'Address Save Failed',
                message: 'Address could not be saved, but your order will proceed.'
              });
            }
          }

          finalDeliveryAddress = {
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            zipCode: deliveryAddress.zipCode,
            country: deliveryAddress.country
          };
        } else {
          // Use selected saved address - send addressId instead of deliveryAddress
          if (!selectedAddressId) {
            addNotification({
              type: 'error',
              title: 'Address Required',
              message: 'Please select a delivery address.'
            });
            setLoading(false);
            return;
          }

          // Set addressId for saved address selection
        }

        const checkoutRequest: CheckoutRequest = {
          userId: user.id,
          paymentMethod,
          notes: notes.trim() || undefined
        };

        // Add address information based on selection
        if (useNewAddress) {
          checkoutRequest.deliveryAddress = finalDeliveryAddress;
        } else {
          checkoutRequest.addressId = selectedAddressId!;
        }

        const order = await cartApi.checkout(checkoutRequest);

        // Refresh cart (should be empty now)
        await refreshCart();

        // Navigate to order confirmation or orders page
        navigate('/orders', {
          replace: true,
          state: {
            orderConfirmation: true,
            orderNumber: order.orderNumber
          }
        });

      } catch (error: any) {
        console.error('Checkout failed:', error);
        addNotification({
          type: 'error',
          title: 'Checkout Failed',
          message: error.response?.data?.message || 'Failed to place order. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    } finally {
      // CRITICAL: Always release the submission lock, even on errors/exceptions
      submittingRef.current = false;
    }
  };

  const cartTotalMRP = cart?.totalMRP ?? 0;
  const cartTotalDiscount = cart?.totalDiscount ?? 0;
  const cartTotalSellingPrice = cart?.totalSellingPrice ?? 0;
  const previewSubtotal = previewOrder?.subtotal ?? cartTotalMRP;
  const previewShipping = previewOrder?.totalShipping ?? 0;
  const previewDiscount = previewOrder?.totalDiscount ?? cartTotalDiscount;
  const previewTotal = previewOrder?.totalPrice ?? cartTotalSellingPrice;

  if (!isBuyNow && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <HiShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add items to your cart to proceed with checkout.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <HiArrowLeft className="mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(isBuyNow ? '/' : '/cart')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <HiArrowLeft className="mr-1" />
            {isBuyNow ? 'Back to Home' : 'Back to Cart'}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <HiLocationMarker className="mr-2 text-orange-500" />
                Delivery Address
              </h2>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Choose from your saved addresses ({savedAddresses.length})
                    </h3>
                    {user?.addresses && user.addresses.length > 0 && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ✓ From Registration
                      </span>
                    )}
                  </div>

                  {/* Address Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Delivery Address
                    </label>
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => {
                        const addressId = parseInt(e.target.value);
                        setSelectedAddressId(addressId);
                        setUseNewAddress(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.recipientName} - {address.street}, {address.city}, {address.state}
                          {address.isDefault && ' (Default)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Address Details */}
                  {selectedAddressId && !useNewAddress && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {(() => {
                        const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
                        if (!selectedAddress) return null;

                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm break-words">
                                {selectedAddress.recipientName}
                              </h4>
                              <div className="flex gap-1 flex-wrap">
                                {selectedAddress.isDefault && (
                                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                                {selectedAddress.addressType && (
                                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    {selectedAddress.addressType}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 break-words">
                              {selectedAddress.street}
                              {selectedAddress.landmark && `, Near ${selectedAddress.landmark}`}
                            </p>
                            <p className="text-sm text-gray-600 break-words">
                              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}, {selectedAddress.country}
                            </p>
                            {selectedAddress.phoneNumber && (
                              <p className="text-sm text-gray-600 break-words">
                                Phone: {selectedAddress.phoneNumber}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Add New Address Option */}
              <div className="mb-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    useNewAddress
                      ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    setUseNewAddress(true);
                    setShowAddressForm(true);
                    setSelectedAddressId(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      useNewAddress
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {useNewAddress && <HiCheck className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <HiPlus className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-900 text-sm break-words block">Add a new delivery address</span>
                      <p className="text-sm text-gray-500 break-words">Enter a new address for this order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Address Form */}
              {useNewAddress && showAddressForm && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Add new address</h3>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      Save to my addresses
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="address-recipientName"
                        type="text"
                        value={deliveryAddress.recipientName}
                        onChange={(e) => handleAddressFieldChange('recipientName', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('recipientName')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.recipientName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter recipient name"
                        required
                      />
                      {addressFormErrors.recipientName && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.recipientName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        id="address-phoneNumber"
                        type="tel"
                        value={deliveryAddress.phoneNumber}
                        onChange={(e) => handleAddressFieldChange('phoneNumber', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('phoneNumber')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                        required
                      />
                      {addressFormErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.phoneNumber}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        id="address-street"
                        type="text"
                        value={deliveryAddress.street}
                        onChange={(e) => handleAddressFieldChange('street', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('street')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your street address"
                        required
                      />
                      {addressFormErrors.street && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.street}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        id="address-city"
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('city')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="City"
                        required
                      />
                      {addressFormErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        id="address-state"
                        type="text"
                        value={deliveryAddress.state}
                        onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('state')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="State"
                        required
                      />
                      {addressFormErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        id="address-zipCode"
                        type="text"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => handleAddressFieldChange('zipCode', e.target.value)}
                        onBlur={() => handleAddressFieldBlur('zipCode')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          addressFormErrors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="ZIP Code"
                        required
                      />
                      {addressFormErrors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{addressFormErrors.zipCode}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.country}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Country"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.landmark}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Near landmark"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <select
                        value={deliveryAddress.addressType}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, addressType: e.target.value as 'HOME' | 'OFFICE' | 'OTHER' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="HOME">Home</option>
                        <option value="OFFICE">Office</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <HiCreditCard className="mr-2 text-orange-500" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'COD')}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <HiCash className="mx-3 text-green-500" />
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'ONLINE')}
                    disabled
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <HiCreditCard className="mx-3 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-gray-500">Pay securely online with card/UPI</div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {isBuyNow && buyNowItem && buyNowItem.product ? (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex-1 max-w-full">
                    <div className="font-medium line-clamp-2 overflow-hidden text-ellipsis break-words">{buyNowItem.product.name}</div>
                    <div className="text-gray-500">Qty: {buyNowItem.quantity}</div>
                  </div>
                  <div className="font-medium flex-shrink-0 ml-2">
                    ₹{(buyNowItem.product.price * buyNowItem.quantity).toLocaleString()}
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1 max-w-full">
                      <div className="font-medium line-clamp-2 overflow-hidden text-ellipsis break-words">{item.productName}</div>
                      <div className="text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium flex-shrink-0 ml-2">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              {isBuyNow && buyNowItem && buyNowItem.product ? (
                <>
                  {previewLoading && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      Calculating order preview...
                    </div>
                  )}
                  {previewError && !previewLoading && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                      {previewError}
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>MRP Total:</span>
                    <span>₹{previewOrder?.subtotal ? previewOrder.subtotal.toLocaleString() : (buyNowItem.product.price * buyNowItem.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₹{previewOrder?.totalShipping ? previewOrder.totalShipping.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{previewOrder?.totalDiscount ? previewOrder.totalDiscount.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{previewOrder?.totalPrice ? previewOrder.totalPrice.toLocaleString() : (buyNowItem.product.price * buyNowItem.quantity).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  {previewLoading && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      Calculating order preview...
                    </div>
                  )}
                  {previewError && !previewLoading && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                      {previewError}
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{previewSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₹{previewShipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{previewDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{previewTotal.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading || (!selectedAddressId && !useNewAddress)}
              className="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Place Order (${
                isBuyNow && buyNowItem && buyNowItem.product 
                  ? `₹${(buyNowItem.product.price * buyNowItem.quantity).toLocaleString()}`
                  : `₹${cartTotalSellingPrice.toLocaleString()}`
              })`}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              By placing this order, you agree to our Terms & Conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
