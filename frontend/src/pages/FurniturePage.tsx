import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiHeart, HiStar, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function FurniturePage() {
  const furnitureItems = [
    {
      id: 1,
      name: "Modern Sofa Set",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      price: 45999,
      originalPrice: 65999,
      discount: "30% off",
      rating: 4.5,
      reviews: 1247,
      material: "Premium Fabric",
      dimensions: "L 200cm x W 90cm"
    },
    {
      id: 2,
      name: "Wooden Dining Table",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
      price: 28999,
      originalPrice: 39999,
      discount: "28% off",
      rating: 4.6,
      reviews: 856,
      material: "Solid Wood",
      dimensions: "L 150cm x W 90cm"
    },
    {
      id: 3,
      name: "Queen Size Bed",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
      price: 35999,
      originalPrice: 49999,
      discount: "28% off",
      rating: 4.4,
      reviews: 2134,
      material: "Engineered Wood",
      dimensions: "L 210cm x W 160cm"
    },
    {
      id: 4,
      name: "Office Chair",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
      price: 12999,
      originalPrice: 18999,
      discount: "32% off",
      rating: 4.3,
      reviews: 967,
      material: "Mesh & Plastic",
      dimensions: "H 110cm x W 65cm"
    },
    {
      id: 5,
      name: "Bookshelf Cabinet",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
      price: 15999,
      originalPrice: 22999,
      discount: "30% off",
      rating: 4.5,
      reviews: 634,
      material: "Engineered Wood",
      dimensions: "H 180cm x W 80cm"
    },
    {
      id: 6,
      name: "Coffee Table",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      price: 8999,
      originalPrice: 12999,
      discount: "31% off",
      rating: 4.4,
      reviews: 423,
      material: "Glass & Steel",
      dimensions: "L 120cm x W 60cm"
    }
  ];

  const categories = [
    "Living Room", "Bedroom", "Dining Room", "Office", "Storage", "Outdoor", "Decor", "Lighting"
  ];

  const materials = [
    "Solid Wood", "Engineered Wood", "Metal", "Glass", "Fabric", "Leather", "Plastic", "Rattan"
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
            <span className="text-gray-700">Furniture</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Furniture</h1>
            <p className="text-gray-600">Transform your space with our premium furniture collection</p>
          </div>

          {/* Sub-categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Room</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Material</h2>
            <div className="flex flex-wrap gap-3">
              {materials.map((material) => (
                <button
                  key={material}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  {material}
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
                  <option>₹10,000 - ₹25,000</option>
                  <option>₹25,000 - ₹50,000</option>
                  <option>Above ₹50,000</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Delivery:</label>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All</option>
                  <option>Free Delivery</option>
                  <option>Express Delivery</option>
                  <option>Installation Available</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {furnitureItems.map((product) => (
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
                  <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Free Assembly
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

                  {/* Product Details */}
                  <div className="mb-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium">{product.material}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">{product.dimensions}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-4 p-2 bg-green-50 rounded-md">
                    <div className="text-sm text-green-700">
                      ✓ Free delivery and assembly
                    </div>
                    <div className="text-xs text-green-600">
                      Estimated delivery: 5-7 days
                    </div>
                  </div>

                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2">
                    <HiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Load More Products
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
