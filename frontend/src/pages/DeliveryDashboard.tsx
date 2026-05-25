import { useAuth } from "../context/AuthContext";
import { HiTruck, HiClipboardList, HiLocationMarker, HiCog } from "react-icons/hi";
import Header from "./Header";
import CategoryBar from "./CategoryBar";

export default function DeliveryDashboard() {
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
              <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Portal</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to your Delivery Dashboard, {user?.firstName}! 🚚
          </h2>
          <p className="text-green-100">
            Manage your deliveries and keep customers happy with timely service.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <HiClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Active Deliveries</h3>
                <p className="text-sm text-gray-500">Current orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <HiLocationMarker className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Route Planning</h3>
                <p className="text-sm text-gray-500">Optimize your route</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <HiTruck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Status</h3>
                <p className="text-sm text-gray-500">Check availability</p>
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
                <p className="text-sm text-gray-500">Profile & preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Partner Information</h3>
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
