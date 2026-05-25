import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiTrash, HiPlus, HiMinus, HiShoppingBag, HiArrowLeft } from 'react-icons/hi';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, removeFromCart, updateQuantity, refreshCart } = useCart();
  const { addNotification } = useNotification();
  const [updatingItems, setUpdatingItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    refreshCart();
  }, [user, navigate]); // Removed refreshCart from dependencies to prevent infinite loops

  // Debug: log cart data
  console.log('CartPage - cart data:', cart);
  console.log('CartPage - cart items:', cart?.items);
  console.log('CartPage - cart items length:', cart?.items?.length);

  const handleQuantityUpdate = async (variantId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(variantId);
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [variantId]: true }));
      const success = await updateQuantity(variantId, newQuantity);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Cart Updated',
          message: 'Item quantity updated successfully',
          duration: 1000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update item quantity'
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update item quantity'
      });
    } finally {
      setUpdatingItems(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleRemoveItem = async (variantId: number) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [variantId]: true }));
      const success = await removeFromCart(variantId);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Item Removed',
          message: 'Item removed from cart successfully',
          duration: 1500
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Removal Failed',
          message: 'Failed to remove item from cart'
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      addNotification({
        type: 'error',
        title: 'Removal Failed',
        message: 'Failed to remove item from cart'
      });
    } finally {
      setUpdatingItems(prev => ({ ...prev, [variantId]: false }));
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <HiShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <HiArrowLeft className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{cart.totalItems} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <HiShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.productName}
                            </h3>
                            {item.variantName && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.variantName}
                              </p>
                            )}
                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                {Object.entries(item.attributes)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' | ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.variantId)}
                            disabled={updatingItems[item.variantId]}
                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityUpdate(item.variantId, item.quantity - 1)}
                                disabled={updatingItems[item.variantId] || item.quantity <= 1}
                                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <HiMinus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityUpdate(item.variantId, item.quantity + 1)}
                                disabled={updatingItems[item.variantId]}
                                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              >
                                <HiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.price)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">{formatPrice(cart.totalMRP)}</span>
                </div>
                
                {cart.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(cart.totalDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(cart.totalSellingPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {cart.totalDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    You're saving {formatPrice(cart.totalDiscount)} on this order!
                  </p>
                </div>
              )}

              <button
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
