import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiHeart, HiStar, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function FashionPage() {
  const fashionItems = [
    {
      id: 1,
      name: "Casual Cotton T-Shirt",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      price: 899,
      originalPrice: 1299,
      discount: "31% off",
      rating: 4.3,
      reviews: 2847,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Navy"]
    },
    {
      id: 2,
      name: "Designer Jeans",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      price: 2499,
      originalPrice: 3999,
      discount: "38% off",
      rating: 4.5,
      reviews: 1654,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Blue", "Black", "Grey"]
    },
    {
      id: 3,
      name: "Formal Shirt",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      price: 1799,
      originalPrice: 2499,
      discount: "28% off",
      rating: 4.4,
      reviews: 987,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["White", "Blue", "Pink"]
    },
    {
      id: 4,
      name: "Summer Dress",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      price: 1999,
      originalPrice: 2999,
      discount: "33% off",
      rating: 4.6,
      reviews: 3421,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Floral", "Solid", "Striped"]
    },
    {
      id: 5,
      name: "Sports Sneakers",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      price: 3999,
      originalPrice: 5999,
      discount: "33% off",
      rating: 4.7,
      reviews: 5678,
      sizes: ["6", "7", "8", "9", "10", "11"],
      colors: ["White", "Black", "Red"]
    },
    {
      id: 6,
      name: "Winter Jacket",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop",
      price: 4999,
      originalPrice: 7999,
      discount: "38% off",
      rating: 4.5,
      reviews: 2134,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Brown"]
    }
  ];

  const categories = [
    "Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Watches", "Bags", "Jewelry", "Kids Fashion"
  ];

  const brands = [
    "Nike", "Adidas", "Zara", "H&M", "Levi's", "Tommy Hilfiger", "Calvin Klein", "Puma"
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
            <span className="text-gray-700">Fashion</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Fashion</h1>
            <p className="text-gray-600">Discover the latest trends in fashion and style</p>
          </div>

          {/* Sub-categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:border-pink-500 hover:text-pink-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Brands */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Brands</h2>
            <div className="flex flex-wrap gap-3">
              {brands.map((brand) => (
                <button
                  key={brand}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-pink-500 hover:text-pink-600 transition-colors"
                >
                  {brand}
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
                  <option>Under ₹500</option>
                  <option>₹500 - ₹1,000</option>
                  <option>₹1,000 - ₹3,000</option>
                  <option>Above ₹3,000</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Size:</label>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All Sizes</option>
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fashionItems.map((product) => (
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

                  {/* Size Selection */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Sizes:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="text-xs border border-gray-300 px-2 py-1 rounded hover:border-pink-500 cursor-pointer"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Color Options */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Colors:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2">
                    <HiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Load More Products
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
