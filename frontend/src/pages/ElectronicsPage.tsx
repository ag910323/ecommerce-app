import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiHeart, HiStar, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function ElectronicsPage() {
  const electronics = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
      price: 134900,
      originalPrice: 159900,
      discount: "16% off",
      rating: 4.6,
      reviews: 15672,
      features: ["A17 Pro Chip", "Titanium Design", "Pro Camera System"]
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      price: 124999,
      originalPrice: 144999,
      discount: "14% off",
      rating: 4.5,
      reviews: 8934,
      features: ["S Pen Included", "200MP Camera", "AI Features"]
    },
    {
      id: 3,
      name: "MacBook Air M3",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      price: 114900,
      originalPrice: 134900,
      discount: "15% off",
      rating: 4.8,
      reviews: 12456,
      features: ["M3 Chip", "18hr Battery", "Liquid Retina Display"]
    },
    {
      id: 4,
      name: "Sony WH-1000XM5",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      price: 29990,
      originalPrice: 34990,
      discount: "14% off",
      rating: 4.7,
      reviews: 6789,
      features: ["Noise Cancelling", "30hr Battery", "Premium Sound"]
    },
    {
      id: 5,
      name: "iPad Pro 12.9 M2",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
      price: 112900,
      originalPrice: 129900,
      discount: "13% off",
      rating: 4.6,
      reviews: 4567,
      features: ["M2 Chip", "12.9 Display", "Apple Pencil Support"]
    },
    {
      id: 6,
      name: "Dell XPS 13",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      price: 89999,
      originalPrice: 109999,
      discount: "18% off",
      rating: 4.4,
      reviews: 3456,
      features: ["InfinityEdge Display", "11th Gen Intel", "Ultrabook"]
    }
  ];

  const categories = [
    "Smartphones", "Laptops", "Headphones", "Tablets", "Cameras", "Gaming", "Smart Watches", "Audio"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CategoryBar />
      
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center mb-4 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline">
              Home
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-700">Electronics</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Electronics</h1>
            <p className="text-gray-600">Discover the latest in technology and electronics</p>
          </div>

          {/* Sub-categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Customer Reviews</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Price:</label>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All Prices</option>
                  <option>Under ₹10,000</option>
                  <option>₹10,000 - ₹50,000</option>
                  <option>₹50,000 - ₹1,00,000</option>
                  <option>Above ₹1,00,000</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Brand:</label>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All Brands</option>
                  <option>Apple</option>
                  <option>Samsung</option>
                  <option>Sony</option>
                  <option>Dell</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electronics.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <HiHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    {product.discount}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <HiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">({product.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2">
                    <HiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Load More Products
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
