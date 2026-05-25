import { Link } from "react-router-dom";
import { HiOutlineShoppingCart, HiHeart } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearch } from "../context/SearchContext";
import NotificationDropdown from "../components/NotificationDropdown";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { wishlists } = useWishlist();
  const { searchQuery, setSearchQuery, handleSearch, handleKeyPress, searchLoading, isSearching, clearSearch } = useSearch();
  // Sum all items across all wishlists for the badge
  const wishlistCount = wishlists.reduce((sum, w) => sum + (w.items?.length || 0), 0);

  return (
    <header className="w-full bg-black text-white px-4 py-3 shadow-md border-b border-gray-800">
      <div className="flex items-center w-full justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wide select-none text-white"
          >
            MyShop
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-yellow-400 transition-colors font-medium">
            Home
          </Link>
          <Link to="/shop" className="text-white hover:text-yellow-400 transition-colors font-medium">
            Shop
          </Link>

          {user ? (
            <>
              <Link to="/orders" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Orders
              </Link>

              {/* Account Dropdown */}
              <div className="flex flex-col justify-center cursor-pointer relative group">
                <span className="text-xs text-gray-300 group-hover:text-yellow-400 transition-colors">
                  Hello, {user.firstName || user.username}
                </span>
                <span className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                  Account
                </span>

                {/* Simple Dropdown Menu */}
                <div className="absolute top-full right-0 mt-1 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-[100] min-w-48">
                  <div className="py-2">
                        {/* Profile Link */}
                    <div className="px-2 py-1 border-b border-gray-200">
                      <Link to="/profile" className="block px-2 py-1 hover:bg-gray-100 text-sm">
                        My Profile
                      </Link>
                    </div>

                    {/* Seller Links */}
                    {user.roleNames?.includes("SELLER") && (
                      <div className="px-2 py-1 border-b border-gray-200">
                        <Link to="/seller/products" className="block px-2 py-1 hover:bg-gray-100 text-sm">
                          Manage Products
                        </Link>
                        <Link to="/seller-dashboard" className="block px-2 py-1 hover:bg-gray-100 text-sm">
                          Seller Dashboard
                        </Link>
                      </div>
                    )}

                    {/* Sign Out */}
                    <div className="px-2 py-1">
                      <button
                        onClick={logout}
                        className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-sm text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Register
              </Link>
              <Link to="/register?seller=true" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                Sell on MyShop
              </Link>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for products..."
              className="flex-1 px-3 py-1.5 text-sm bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-3 py-1.5 bg-yellow-400 text-black text-sm rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {searchLoading ? '...' : 'Search'}
            </button>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="px-2 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {user && <NotificationDropdown />}

          {/* Wishlist */}
          <Link to="/wishlist" className="flex items-center justify-center cursor-pointer relative group transition-colors">
            <div className="relative">
              <HiHeart className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center justify-center cursor-pointer relative group transition-colors">
            <div className="relative">
              <HiOutlineShoppingCart className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
