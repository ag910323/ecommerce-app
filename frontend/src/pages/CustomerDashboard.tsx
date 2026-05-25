import { useAuth } from "../context/AuthContext";
import { HiShoppingCart, HiHeart, HiClipboardList, HiCog } from "react-icons/hi";
import Header from "./Header";
import CategoryBar from "./CategoryBar";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      <CategoryBar />
      
      {/* Dashboard Header - Simplified since we now have the main header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-yellow-100">
            Ready to explore amazing products in our marketplace?
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                Status: {user?.userStatus}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                Role: {user?.roleNames.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <HiShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-500">Discover new items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <HiClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-500">Track your purchases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-pink-100 rounded-lg p-3">
                <HiHeart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Wishlist</h3>
                <p className="text-sm text-gray-500">Saved for later</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <HiCog className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Manage account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Shopping Cart</h3>
                <p className="text-sm text-gray-500">
                  Cart ID: {user?.cartResponse?.id} | Items: {user?.cartResponse?.items?.length || 0}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <HiShoppingCart className="h-8 w-8 text-gray-400" />
                {user?.cartResponse?.items?.length === 0 ? (
                  <span className="text-sm text-gray-500">Empty cart</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    {user?.cartResponse?.items?.length || 0} items
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Username:</span> {user?.username}</p>
                  <p><span className="text-gray-500">Email:</span> {user?.email}</p>
                  <p><span className="text-gray-500">User ID:</span> {user?.userId}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Account Status</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Verification:</span>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.userVerificationResponse?.status === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.userVerificationResponse?.status}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Verified At:</span>{" "}
                    {user?.userVerificationResponse?.verifiedAt 
                      ? new Date(user.userVerificationResponse.verifiedAt).toLocaleDateString()
                      : 'Not verified'
                    }
                  </p>
                  <p>
                    <span className="text-gray-500">Account Active:</span>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
