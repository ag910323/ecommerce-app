import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { HiArrowLeft, HiHeart, HiShare, HiStar, HiShoppingCart, HiLightningBolt } from 'react-icons/hi';
import { productApi } from '../api/productApi';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';
import Header from './Header';
import CategoryBar from './CategoryBar';
import type { ProductResponse, VariantResponse } from '../types';

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { addToWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const parseDescription = (description: string) => {
    if (!description) return [];
    
    const sections = description.split('\n').filter(line => line.trim());
    const parsedSections = [];
    
    for (const section of sections) {
      const match = section.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (match) {
        parsedSections.push({
          title: match[1],
          content: match[2]
        });
      } else if (parsedSections.length > 0) {
        // Append to last section if no bracket found
        parsedSections[parsedSections.length - 1].content += ' ' + section;
      } else {
        parsedSections.push({
          title: null,
          content: section
        });
      }
    }
    
    return parsedSections;
  };
  const { parentCategories } = useCategories();

  // Find category by ID
  const findCategory = (id: number) => {
    for (const parent of parentCategories) {
      if (parent.id === id) return parent;
      if (parent.subCategories) {
        for (const sub of parent.subCategories) {
          if (sub.id === id) return sub;
          if (sub.subCategories) {
            for (const subSub of sub.subCategories) {
              if (subSub.id === id) return subSub;
            }
          }
        }
      }
    }
    return null;
  };

  // Track product click on page load (only if user is logged in)
  useEffect(() => {
    if (!productId || !user) return;

    // Get source from navigation state, default to "UNKNOWN"
    const source = (location.state as any)?.source || 'UNKNOWN';
    
    // Fire tracking API (fire and forget)
    productApi.trackProductClick(parseInt(productId), source, user.id);
  }, [productId, user]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getProductById(parseInt(productId));
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
          setSelectedAttributes(data.variants[0].attributes);
        }
      } catch (err: any) {
        setError('Product not found');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const stock = selectedVariant?.stockQuantity || product.stockQuantity;
    if (stock === 0) {
      setQuantity(0);
      return;
    }

    setQuantity(prev => {
      const max = stock ?? prev;
      return Math.min(Math.max(prev, 1), max);
    });
  }, [selectedVariant, product]);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => {
      if (!product) return prev;
      const stock = selectedVariant?.stockQuantity || product.stockQuantity;
      if (stock === 0) return 0;
      const max = stock ?? Infinity;
      const next = Math.max(1, prev + change);
      return Math.min(next, max);
    });
  };

  const handleQuantityInput = (value: string) => {
    if (!product) return;
    const stock = selectedVariant?.stockQuantity || product.stockQuantity;
    if (stock === 0) {
      setQuantity(0);
      return;
    }

    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;

    const max = stock ?? Infinity;
    setQuantity(Math.min(Math.max(parsed, 1), max));
  };

  const handleQuantityBlur = () => {
    if (!product) return;
    const stock = selectedVariant?.stockQuantity || product.stockQuantity;
    if (stock === 0) {
      setQuantity(0);
      return;
    }

    if (quantity < 1) {
      setQuantity(1);
      return;
    }

    if (stock && quantity > stock) {
      setQuantity(stock);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please login to add items to cart'
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    if ((selectedVariant?.stockQuantity || product.stockQuantity) === 0) {
      addNotification({
        type: 'error',
        title: 'Out of Stock',
        message: 'This product is currently out of stock.'
      });
      return;
    }

    try {
      setAddingToCart(true);
      const variantId = selectedVariant?.id || product.variants![0].id;
      await addToCart(variantId, quantity);
      addNotification({
        type: 'success',
        title: 'Item Added',
        message: `Added ${quantity} item(s) to cart successfully!`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please login to add items to wishlist'
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      setAddingToWishlist(true);
      await addToWishlist(product.id);
      addNotification({
        type: 'success',
        title: 'Item Added',
        message: 'Added to wishlist successfully!'
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to wishlist. Please try again.'
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    const stock = selectedVariant?.stockQuantity || product?.stockQuantity;
    if (!product || stock === 0) return;

    const variantId = selectedVariant?.id || product.variants![0].id;
    const buyNowItem = {
      productId: product.id,
      variantId,
      quantity
    };

    if (!user) {
      // Pass Buy Now item through navigation state to login
      navigate('/login', { state: { buyNowItem } });
      return;
    }

    // Pass Buy Now item through navigation state to checkout
    navigate('/checkout', { state: { buyNowItem } });
  };

  if (loading) {
    return (
      <>
        <Header />
        <CategoryBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <CategoryBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const category = product.categoryId ? findCategory(product.categoryId) : null;
  const images = selectedVariant?.images || product.imageUrls || ['/placeholder-image.jpg'];

  return (
    <>
      <Header />
      <CategoryBar />
      <div className="container mx-auto px-4 py-6">
        {/* Back Button & Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm">
                  Home
                </Link>
              </li>
              {category && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      to={`/category/${category.id}`}
                      className="text-gray-700 hover:text-blue-600 text-sm"
                    >
                      {category.name}
                    </Link>
                  </div>
                </li>
              )}
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900 font-medium text-sm">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="relative">
            {images.length > 1 && (
              <div className="absolute left-0 top-0 z-10 flex flex-col gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    } bg-gray-100`}
                    type="button"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="w-full pl-[88px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="block w-full h-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
            {/* Product Title & Price */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex-1 mr-4">{product.name}</h1>
                {product.isCurrentlySponsored && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                    Sponsored
                  </span>
                )}
              </div>
              {selectedVariant && (
                <p className="text-gray-600 text-lg mb-3">{selectedVariant.variantName}</p>
              )}

              {/* Brand Info */}
              {product.brandName && (
                <div className="flex items-center space-x-2 mb-3">
                  {(product as any).brandResponse?.logo && (
                    <img
                      src={(product as any).brandResponse.logo}
                      alt={product.brandName}
                      className="w-6 h-6 rounded-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-600">by</span>
                  <span className="font-medium text-gray-900">{product.brandName}</span>
                </div>
              )}

              {/* Price Display */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-blue-600">
                    ₹{(selectedVariant?.price || product.price).toLocaleString()}
                  </span>
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{Math.round(product.price / (1 - product.discountPercentage / 100)).toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                        {product.discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(4.5) 256 reviews</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-3">
                {(selectedVariant?.stockQuantity || product.stockQuantity) === 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 border border-red-200">
                    <HiShoppingCart className="w-4 h-4" />
                    Out of Stock
                  </span>
                ) : ((selectedVariant?.stockQuantity ?? product.stockQuantity) !== undefined && (selectedVariant?.stockQuantity ?? product.stockQuantity)! < 10) ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 border border-yellow-200">
                    Only {selectedVariant?.stockQuantity || product.stockQuantity} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200">
                    In Stock
                  </span>
                )}
              </div>

              {product.sellerName && (
                <p className="text-gray-600 mb-3">
                  Sold by: <span className="font-medium text-blue-600">{product.sellerName}</span>
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1 || (selectedVariant?.stockQuantity || product?.stockQuantity) === 0}
                    type="button"
                  >
                    <span className="text-lg font-bold leading-none">−</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={(selectedVariant?.stockQuantity || product?.stockQuantity) === 0 ? 0 : 1}
                    max={selectedVariant?.stockQuantity ?? product?.stockQuantity ?? undefined}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    onBlur={handleQuantityBlur}
                    className="w-16 text-center border-l border-r border-gray-300 outline-none px-2 py-2 text-sm"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(selectedVariant?.stockQuantity ?? product?.stockQuantity) !== undefined && quantity >= (selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 0) || (selectedVariant?.stockQuantity ?? product?.stockQuantity) === 0}
                    type="button"
                  >
                    <span className="text-lg font-bold leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || (selectedVariant?.stockQuantity || product?.stockQuantity) === 0}
                className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 px-4 rounded-md font-medium hover:from-orange-500 hover:to-orange-600 transition-all shadow-sm border border-orange-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiShoppingCart className="w-5 h-5" />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={(selectedVariant?.stockQuantity || product?.stockQuantity) === 0}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-md font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm border border-yellow-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiLightningBolt className="w-5 h-5" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center justify-center space-x-4 pt-3 border-t border-gray-200">
              <button 
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiHeart className="w-4 h-4" />
                <span className="text-sm">{addingToWishlist ? 'Adding...' : 'Add to Wishlist'}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md shadow-sm">
                <HiShare className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="text-gray-700 leading-relaxed">
                {(() => {
                  const sections = parseDescription(product.description || '');
                  const visibleSections = showFullDescription ? sections : sections.slice(0, 3);
                  
                  return (
                    <div className="space-y-4">
                      {visibleSections.map((section, index) => (
                        <div key={index}>
                          {section.title && (
                            <h4 className="font-semibold text-gray-900 mb-1">{section.title}</h4>
                          )}
                          <p className="text-gray-700">{section.content}</p>
                        </div>
                      ))}
                      
                      {sections.length > 3 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {showFullDescription ? 'Show Less' : `Read More (${sections.length - 3} more sections)`}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.attributes).slice(0, 5).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="ml-1">{String(value)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Delivery Information</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>🚚 Free delivery on orders above ₹499</p>
                <p>⚡ Express delivery available</p>
                <p>🔄 7-day return policy</p>
                <p>💳 Cash on Delivery available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="text-center text-gray-600">
            <p>Related products will be displayed here...</p>
            <Link 
              to={category ? `/category/${category.id}` : '/'}
              className="inline-block mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse Similar Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
