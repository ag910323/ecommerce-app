import Header from '../pages/Header';
import CategoryBar from '../pages/CategoryBar';
import PartnerBrands from '../components/PartnerBrands';
import ProductCardWithPartnership, { type ProductWithPartnership } from '../components/ProductCardWithPartnership';
import PopularBrands from '../components/PopularBrands';
import { HiStar, HiChartBar } from 'react-icons/hi';

export default function BrandPartnerships() {
  // Sample products with different partnership levels
  const sampleProducts: ProductWithPartnership[] = [
    {
      id: 1,
      title: "iPhone 15 Pro Max",
      price: "₹1,59,900",
      originalPrice: "₹1,79,900",
      discount: "11% off",
      rating: 4.8,
      reviews: 12890,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop",
      partnershipLevel: "EXCLUSIVE",
      partnershipBadge: "Exclusive Partner",
      partnershipPriority: 400
    },
    {
      id: 2,
      title: "Samsung Galaxy S24 Ultra",
      price: "₹1,24,999",
      originalPrice: "₹1,39,999",
      discount: "11% off",
      rating: 4.7,
      reviews: 8765,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      partnershipLevel: "TOP",
      partnershipBadge: "Top Brand",
      partnershipPriority: 300
    },
    {
      id: 3,
      title: "Nike Air Jordan",
      price: "₹12,995",
      originalPrice: "₹14,995",
      discount: "13% off",
      rating: 4.6,
      reviews: 5432,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      partnershipLevel: "FEATURED",
      partnershipBadge: "Featured Brand",
      partnershipPriority: 200
    },
    {
      id: 4,
      title: "Sony WH-1000XM5",
      price: "₹29,990",
      originalPrice: "₹34,990",
      discount: "14% off",
      rating: 4.7,
      reviews: 3210,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      partnershipLevel: "PARTNER",
      partnershipBadge: "Brand Partner",
      partnershipPriority: 100
    },
    {
      id: 5,
      title: "Gaming Laptop RTX 4070",
      price: "₹89,999",
      originalPrice: "₹99,999",
      discount: "10% off",
      rating: 4.5,
      reviews: 543,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=300&fit=crop",
      isSponsored: true,
      sponsorPriority: 250
    },
    {
      id: 6,
      title: "Wireless Earbuds",
      price: "₹2,999",
      originalPrice: "₹4,999",
      discount: "40% off",
      rating: 4.3,
      reviews: 1234,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop",
      badge: "Best Seller",
      badgeColor: "bg-green-500"
    }
  ];

  // Flash sale products with progress
  const flashSaleProducts = [
    {
      ...sampleProducts[4],
      id: 7,
      title: "Smart Watch Pro",
      price: "₹3,999",
      originalPrice: "₹8,999",
      discount: "56% off",
      partnershipLevel: "FEATURED" as const,
      partnershipBadge: "Featured Brand"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />
      
      {/* Hero Section */}
      <section className="py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Brand Partnership System</h1>
          <p className="text-xl mb-6">Experience premium brands with verified quality and exclusive benefits</p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <HiStar className="w-5 h-5 text-red-300" />
              <span>Exclusive Partners</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiChartBar className="w-5 h-5 text-yellow-300" />
              <span>Top Brands</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiStar className="w-5 h-5 text-purple-300" />
              <span>Featured Brands</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiStar className="w-5 h-5 text-blue-300" />
              <span>Brand Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Brands Section */}
      <PartnerBrands />

      {/* Popular Brands with Moving Animation */}
      <PopularBrands />

      {/* Featured Products by Partnership Level */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products by Partnership Level</h2>
            <p className="text-gray-600">Products ordered by partnership priority: Exclusive → Top → Featured → Partner → Sponsored → Regular</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProducts.map((product) => (
              <ProductCardWithPartnership key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale with Partnership */}
      <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Flash Sale - Partner Brands</h2>
            <p className="text-gray-600">Limited time offers from our trusted brand partners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSaleProducts.map((product) => (
              <ProductCardWithPartnership 
                key={product.id} 
                product={product} 
                showProgress={true}
                sold={145}
                total={200}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Partnership Levels & Benefits</h2>
            <p className="text-gray-600">Different partnership levels offer unique advantages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <HiStar className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="font-bold text-gray-900">Exclusive Partner</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Highest priority placement</li>
                <li>• Exclusive product launches</li>
                <li>• Premium customer support</li>
                <li>• Special homepage features</li>
                <li>• Maximum visibility boost</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center mb-4">
                <HiChartBar className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="font-bold text-gray-900">Top Brand</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• High priority in search</li>
                <li>• Featured in top sections</li>
                <li>• Enhanced product badges</li>
                <li>• Priority customer service</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <HiStar className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="font-bold text-gray-900">Featured Brand</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Featured brand sections</li>
                <li>• Enhanced search ranking</li>
                <li>• Quality verification badge</li>
                <li>• Marketing support</li>
                <li>• Performance insights</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <HiStar className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="font-bold text-gray-900">Brand Partner</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Verified partner badge</li>
                <li>• Quality assurance</li>
                <li>• Basic priority boost</li>
                <li>• Partner support</li>
                <li>• Promotional opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Notes */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">🚀 Implementation Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">Partnership System:</h4>
                <ul className="space-y-1">
                  <li>• Dynamic partnership badges</li>
                  <li>• Priority-based product sorting</li>
                  <li>• Partnership level indicators</li>
                  <li>• Benefit highlights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">UI Features:</h4>
                <ul className="space-y-1">
                  <li>• Animated brand carousel</li>
                  <li>• Partnership tier colors</li>
                  <li>• Hover effects and transitions</li>
                  <li>• Responsive grid layouts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
