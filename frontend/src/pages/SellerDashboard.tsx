import { useAuth } from "../context/AuthContext";
import { HiOfficeBuilding, HiChartBar, HiClipboardList, HiCog } from "react-icons/hi";
import { Link } from "react-router-dom";
import Header from "./Header";
import CategoryBar from "./CategoryBar";

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      <CategoryBar />
      
      {/* Dashboard Header - Simplified */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Seller Portal</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to your Seller Dashboard, {user?.firstName}! 🏪
          </h2>
          <p className="text-blue-100">
            Manage your products, orders, and grow your business on our marketplace.
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Store Status: {user?.userStatus === 'VERIFIED' ? 'Active' : 'Pending Verification'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Account Type: Seller
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <HiOfficeBuilding className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <HiClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-sm text-gray-500">Orders Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <HiChartBar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">₹0</h3>
                <p className="text-sm text-gray-500">Sales This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <HiCog className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">4.5★</h3>
                <p className="text-sm text-gray-500">Store Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            to="/seller/products"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer block group"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 group-hover:bg-green-200 transition-colors">
                <HiOfficeBuilding className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">Manage Products</h3>
                <p className="text-sm text-gray-500">Add, edit, and organize</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <HiClipboardList className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                <p className="text-sm text-gray-500">Process and fulfill</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <HiChartBar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">Sales insights</p>
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
                <p className="text-sm text-gray-500">Store configuration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seller Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Username:</span> {user?.username}</p>
                  <p><span className="text-gray-500">Email:</span> {user?.email}</p>
                  <p><span className="text-gray-500">User ID:</span> {user?.userId}</p>
                  <p><span className="text-gray-500">Roles:</span> {user?.roleNames?.join(", ")}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Account Status</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.userStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.userStatus}
                    </span>
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
