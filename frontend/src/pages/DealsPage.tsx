import { useState, useEffect } from "react";
import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import ProductGrid from "../components/ProductGrid.tsx";
import { productApi } from "../api/productApi";
import type { ProductResponse } from "../types";
import { PRODUCT_STATUS } from "../types";
import { HiStar } from "react-icons/hi";

export default function DealsPage() {
  const [dealsProducts, setDealsProducts] = useState<ProductResponse[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  // Load deals products from API (reusing HomePage logic)
  const loadDealsProducts = async () => {
    console.log('ENTERING loadDealsProducts function in DealsPage');
    console.log('🔄 Starting to load deals products...');
    try {
      setDealsLoading(true);
      console.log('Calling Deals API');
      const response = await productApi.getDealsProducts();
      console.log('✅ Deals products API response:', response);

      // Validate response
      if (!response || typeof response !== 'object' || !Array.isArray(response.content)) {
        console.error('❌ Deals products response is not valid:', response);
        throw new Error('Invalid API response format');
      }

      const products = response.content;

      // Validate each product has required fields
      const validProducts = products.filter(product => {
        if (!product || typeof product !== 'object') {
          console.warn('⚠️ Invalid product object:', product);
          return false;
        }
        if (!product.name || !product.price) {
          console.warn('⚠️ Product missing required fields (name/price):', product);
          return false;
        }
        return true;
      });

      console.log(`📊 Setting ${validProducts.length} valid deals products`);
      setDealsProducts(validProducts);
    } catch (error) {
      console.error('❌ Failed to load deals products:', error);
      // Fallback with some static data to ensure page renders
      console.log('🔄 Using fallback data for deals products');
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
      console.log('🏁 Finished loading deals products');
    }
  };

  // Load deals on component mount
  useEffect(() => {
    loadDealsProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <Header />

      {/* Category Bar Section */}
      <CategoryBar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals of the Day</h1>
            <p className="text-gray-600">Discover amazing deals and offers available today</p>
          </div>
        </section>

        {/* Deals Products Grid */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <ProductGrid
              products={dealsProducts}
              variant="deals"
              loading={dealsLoading}
              emptyMessage={{
                title: "No Deals Available",
                description: "Check back later for amazing deals and offers.",
                icon: <HiStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              }}
            />
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