import Header from "../pages/Header.tsx";
import CategoryBar from "../pages/CategoryBar.tsx";
import HeroBanner from "../components/HeroBanner.tsx";
import PopularBrandsSection from "../components/PopularBrandsSection.tsx";
import CategoriesSection from "../components/CategoriesSection.tsx";
import SponsoredSection from "../components/SponsoredSection.tsx";
import DealsSection from "../components/DealsSection.tsx";
import RecommendedSection from "../components/RecommendedSection.tsx";
import ProductGrid from "../components/ProductGrid.tsx";
import ProductCarousel from "../components/ProductCarousel.tsx";
import ExploreSection from "../components/ExploreSection.tsx";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import { HiStar } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { productApi } from "../api/productApi";
import type { ProductResponse } from "../types";
import { PRODUCT_STATUS } from "../types";

export default function HomePage() {
  const [sponsoredProducts, setSponsoredProducts] = useState<ProductResponse[]>([]);
  const [sponsoredLoading, setSponsoredLoading] = useState(false);
  const [dealsProducts, setDealsProducts] = useState<ProductResponse[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductResponse[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recentProducts, setRecentProducts] = useState<ProductResponse[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const { searchedProducts, searchLoading, isSearching, searchQuery } = useSearch();
  const { user } = useAuth();

  const hasFetchedRecent = useRef(false);

  // Load recent browsed products from API (authenticated users only)
  const loadRecentProducts = async () => {
    if (!user?.id) return;

    try {
      setRecentLoading(true);
      const products = await productApi.getRecentBrowsedProducts(user.id);
      setRecentProducts(products);
    } catch (error) {
      // Fail silently - don't break the page
      console.debug('Failed to load recent products:', error);
      setRecentProducts([]);
    } finally {
      setRecentLoading(false);
    }
  };

  // Load sponsored products from API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadSponsoredProducts = async () => {
    try {
      setSponsoredLoading(true);
      const response = await productApi.getSponsoredProductsPublic();

      if (!response || typeof response !== 'object' || !Array.isArray(response.content)) {
        throw new Error('Invalid API response format');
      }

      const products = response.content;
      const validProducts = products.filter(product => {
        if (!product || typeof product !== 'object') return false;
        if (!product.name || !product.price) return false;
        return true;
      });

      setSponsoredProducts(validProducts);
    } catch (error) {
      setSponsoredProducts([
        {
          id: 7,
          name: "USB-C Fast Charger",
          description: "Fast charging USB-C adapter",
          price: 899,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop"],
          rating: 4.3,
          discountPercentage: 44
        },
        {
          id: 8,
          name: "Wireless Phone Charger",
          description: "Qi wireless charging pad",
          price: 1299,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1609592082880-95e2d17ef1f5?w=300&h=300&fit=crop"],
          rating: 4.2,
          discountPercentage: 41
        }
      ]);
    } finally {
      setSponsoredLoading(false);
    }
  };

  // Load deals products from API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDealsProducts = async () => {
    try {
      setDealsLoading(true);
      const response = await productApi.getDealsProducts();

      if (!response || typeof response !== 'object' || !Array.isArray(response.content)) {
        throw new Error('Invalid API response format');
      }

      const products = response.content;
      const validProducts = products.filter(product => {
        if (!product || typeof product !== 'object') return false;
        if (!product.name || !product.price) return false;
        return true;
      });

      setDealsProducts(validProducts);
    } catch (error) {
      setDealsProducts([
        {
          id: 1,
          name: "Wireless Bluetooth Headphones",
          description: "High-quality wireless headphones",
          price: 2999,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"],
          rating: 4.5,
          discountPercentage: 50
        },
        {
          id: 2,
          name: "Smart Watch Series 7",
          description: "Latest smartwatch with health tracking",
          price: 12999,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop"],
          rating: 4.3,
          discountPercentage: 32
        }
      ]);
    } finally {
      setDealsLoading(false);
    }
  };

  // Load recommended products from API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadRecommendedProducts = async () => {
    try {
      setRecommendedLoading(true);
      const response = await productApi.getRecommendedProducts();

      if (!response || typeof response !== 'object' || !Array.isArray(response.content)) {
        throw new Error('Invalid API response format');
      }

      const products = response.content;
      const validProducts = products.filter(product => {
        if (!product || typeof product !== 'object') return false;
        if (!product.name || !product.price) return false;
        return true;
      });

      setRecommendedProducts(validProducts);
    } catch (error) {
      setRecommendedProducts([
        {
          id: 5,
          name: "Bluetooth Gaming Headset",
          description: "Wireless gaming headset with mic",
          price: 3499,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop"],
          rating: 4.4,
          discountPercentage: 42
        },
        {
          id: 6,
          name: "Portable Bluetooth Speaker",
          description: "Waterproof portable speaker",
          price: 2199,
          status: PRODUCT_STATUS.ACTIVE,
          imageUrls: ["https://images.unsplash.com/photo-1545127398-14699f92334b?w=300&h=300&fit=crop"],
          rating: 4.7,
          discountPercentage: 45
        }
      ]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Load all products on mount
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        await Promise.all([
          loadDealsProducts(),
          loadRecommendedProducts(),
          loadSponsoredProducts()
        ]);
      } catch (error) {
        console.error('HomePage initialization error:', error);
      }
    };
    
    loadAllProducts();
  }, []);

  // Load recent browsed products on mount (authenticated users only)
  useEffect(() => {
    if (hasFetchedRecent.current) return;
    if (!user?.id) return;

    hasFetchedRecent.current = true;
    loadRecentProducts();
  }, [user?.id]);

  // Static data
  const banners = [
    {
      title: "Big Billion Day Sale",
      subtitle: "Unbeatable deals on your favorite products",
      buttonText: "Shop Now",
      gradient: "from-blue-600 to-purple-600",
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=600&fit=crop"
    },
    {
      title: "Start Selling Today!",
      subtitle: "Join thousands of sellers and grow your business with us",
      buttonText: "Become a Seller",
      gradient: "from-orange-600 to-red-600",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
      link: "/register"
    },
    {
      title: "Mega Electronics Sale",
      subtitle: "Up to 80% off on latest gadgets and electronics",
      buttonText: "Explore Electronics",
      gradient: "from-green-600 to-blue-600",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop"
    },
    {
      title: "Fashion Fiesta",
      subtitle: "Trending styles for every occasion",
      buttonText: "Shop Fashion",
      gradient: "from-pink-600 to-red-600",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop"
    },
    {
      title: "Home & Kitchen Bonanza",
      subtitle: "Transform your space with our premium collection",
      buttonText: "Shop Home",
      gradient: "from-orange-600 to-yellow-600",
      image: "https://images.unsplash.com/photo-1556909114-54d85e8ea271?w=1200&h=600&fit=crop"
    }
  ];

  const categories = [
    { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop" },
    { name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop" },
    { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&h=150&fit=crop" },
    { name: "Books", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150&h=150&fit=crop" },
    { name: "Sports", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop" },
    { name: "Toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=150&h=150&fit=crop" },
    { name: "Grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <Header />

      {/* Category Bar Section */}
      <CategoryBar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner - Memoized, never re-renders */}
        <HeroBanner banners={banners} />

        {/* Popular Brands Section - Memoized, never re-renders */}
        <PopularBrandsSection />

        {/* Categories Grid - Memoized, never re-renders */}
        <CategoriesSection categories={categories} />

        {/* Sponsored Products - Only show if loading or has products */}
        {(sponsoredLoading || sponsoredProducts.length > 0) && (
          <SponsoredSection
            products={sponsoredProducts}
            loading={sponsoredLoading}
          />
        )}

        {/* Search Results Section */}
        {isSearching && (
          <section className="py-8 bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                  <p className="text-gray-600">Found {searchedProducts.length} products for "{searchQuery}"</p>
                </div>
              </div>
              <ProductGrid
                products={searchedProducts}
                loading={searchLoading}
                emptyMessage={{
                  title: "No Products Found",
                  description: `No products match your search for "${searchQuery}". Try different keywords.`,
                  icon: <HiStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                }}
                source="HOME"
              />
            </div>
          </section>
        )}

        {/* Deals of the Day - Only show if loading or has products */}
        {(dealsLoading || dealsProducts.length > 0) && (
          <DealsSection
            products={dealsProducts}
            loading={dealsLoading}
          />
        )}

        {/* Because You Browsed - Only render if user is logged in and has recent products */}
        {recentProducts.length > 0 && (
          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Because You Browsed</h2>
                  <p className="text-gray-600">Products based on your recent activity</p>
                </div>
              </div>
              <ProductCarousel
                products={recentProducts}
                loading={recentLoading}
                source="HOME"
              />
            </div>
          </section>
        )}

        {/* Recommended Products - Only show if loading or has products */}
        {(recommendedLoading || recommendedProducts.length > 0) && (
          <RecommendedSection
            products={recommendedProducts}
            loading={recommendedLoading}
          />
        )}

        {/* Explore Products - ONLY this section re-renders on scroll */}
        <ExploreSection />

        {/* Promotional Banner Section */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Fashion Sale</h3>
                <p className="mb-4">Up to 70% off on trending styles</p>
                <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                  Shop Fashion
                </button>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Electronics Deal</h3>
                <p className="mb-4">Latest gadgets at best prices</p>
                <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                  Shop Electronics
                </button>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Home & Kitchen</h3>
                <p className="mb-4">Transform your living space</p>
                <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                  Shop Home
                </button>
              </div>
            </div>
          </div>
        </section>
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

