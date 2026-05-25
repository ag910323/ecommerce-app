import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiHeart, HiStar, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function MobilesPage() {
  const mobiles = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
      price: 134900,
      originalPrice: 159900,
      discount: "16% off",
      rating: 4.6,
      reviews: 15672,
      storage: "256GB",
      color: "Natural Titanium"
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
      storage: "512GB",
      color: "Titanium Black"
    },
    {
      id: 3,
      name: "OnePlus 12",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      price: 64999,
      originalPrice: 79999,
      discount: "19% off",
      rating: 4.4,
      reviews: 5432,
      storage: "256GB",
      color: "Silky Black"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CategoryBar />
      
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-4 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline">Home</Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-700">Mobiles</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mobiles</h1>
            <p className="text-gray-600">Latest smartphones with cutting-edge technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mobiles.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-t-lg" />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <HiHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    {product.discount}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">({product.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="mb-4 space-y-1">
                    <div className="text-sm text-gray-600">Storage: {product.storage}</div>
                    <div className="text-sm text-gray-600">Color: {product.color}</div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2">
                    <HiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
