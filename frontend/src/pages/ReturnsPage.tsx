import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiRefresh, HiTruck, HiCheckCircle, HiExclamationCircle, HiSearch } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useState } from "react";

// Hardcoded return requests for demo
const returnRequests = [
  {
    id: "RT001",
    orderId: "ORD-2024-001234",
    productName: "Wireless Bluetooth Headphones",
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    returnReason: "Product defective",
    requestDate: "2024-10-01",
    status: "Processing",
    expectedRefund: "₹2,999",
    refundMethod: "Original Payment Method"
  },
  {
    id: "RT002", 
    orderId: "ORD-2024-001145",
    productName: "Smart Watch Series 7",
    productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    returnReason: "Wrong size delivered",
    requestDate: "2024-09-28",
    status: "Approved",
    expectedRefund: "₹12,999",
    refundMethod: "Wallet Credit"
  },
  {
    id: "RT003",
    orderId: "ORD-2024-001089",
    productName: "Premium Coffee Maker",
    productImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    returnReason: "Not as described",
    requestDate: "2024-09-25",
    status: "Completed",
    expectedRefund: "₹8,499",
    refundMethod: "Bank Account"
  }
];

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("past 3 months");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Hardcoded orders for demo
  const orders = [
    {
      id: "ORD-2024-001234",
      date: "2024-09-28",
      status: "Delivered",
      total: "₹3,499",
      items: [
        {
          name: "Wireless Bluetooth Headphones",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
          qty: 1
        }
      ]
    },
    {
      id: "ORD-2024-001145",
      date: "2024-09-20",
      status: "Shipped",
      total: "₹12,999",
      items: [
        {
          name: "Smart Watch Series 7",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
          qty: 1
        }
      ]
    },
    {
      id: "ORD-2024-001089",
      date: "2024-09-10",
      status: "Delivered",
      total: "₹8,499",
      items: [
        {
          name: "Premium Coffee Maker",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
          qty: 1
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <HiRefresh className="w-4 h-4" />;
      case "Approved":
        return <HiTruck className="w-4 h-4" />;
      case "Completed":
        return <HiCheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <HiExclamationCircle className="w-4 h-4" />;
      default:
        return <HiRefresh className="w-4 h-4" />;
    }
  };

  return (
  <div className="min-h-screen flex flex-col bg-white">
    {/* Header Section */}
    <Header />
    {/* Category Bar Section */}
    <CategoryBar />
    {/* Main Content */}
    <main className="flex-1 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-4 text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline">
            Your Account
          </Link>
          <span className="mx-2 text-gray-500">›</span>
          <span className="text-gray-700">Your Orders</span>
        </div>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-normal text-gray-900 mb-4">Your Orders</h1>
          {/* Search Bar and Filter Dropdown - aligned row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1">
                  <HiSearch className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Search Orders</p>
            </div>
            {/* Filter Dropdown and Search Button aligned */}
            <div className="flex gap-2 items-end">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-40"
              >
                <option value="all">All Orders</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-900 rounded-md font-medium whitespace-nowrap hover:bg-gray-100 transition-colors">
                Search Orders
              </button>
            </div>
          </div>
          {/* Orders navigation tabs */}
          <div className="flex gap-2 mb-4">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors">Orders</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors">Buy Again</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors">Not Yet Shipped</button>
          </div>
        </div>

          {/* Time Frame Selection */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-medium text-gray-900">Returns in</span>
            <select 
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="past 3 months">past 3 months</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Orders Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">Order ID:</span> <span className="text-gray-700">{order.id}</span>
                    </div>
                    <div className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center mr-6">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-600">Qty: {item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">Status:</span> <span className="text-blue-700">{order.status}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Total:</span> <span className="text-green-700">{order.total}</span>
                    </div>
                    <Link to={`/orders/${order.id}`} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Requests Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Returns</h2>
            {returnRequests.map((returnItem) => (
              <div key={returnItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={returnItem.productImage}
                      alt={returnItem.productName}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {returnItem.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Return ID: <span className="font-medium">{returnItem.id}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Order ID: <span className="font-medium">{returnItem.orderId}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Request Date: {new Date(returnItem.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                    {getStatusIcon(returnItem.status)}
                    <span className="ml-1">{returnItem.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Return Reason</p>
                    <p className="text-sm text-gray-600">{returnItem.returnReason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Expected Refund</p>
                    <p className="text-sm text-gray-600">{returnItem.expectedRefund}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Refund Method</p>
                    <p className="text-sm text-gray-600">{returnItem.refundMethod}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-3">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                    Track Return
                  </button>
                  {returnItem.status === "Processing" && (
                    <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Return Policy Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Return Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Return Window</p>
                <p>Most items can be returned within 30 days of delivery</p>
              </div>
              <div>
                <p className="font-medium mb-1">Refund Processing</p>
                <p>Refunds are processed within 5-7 business days after approval</p>
              </div>
              <div>
                <p className="font-medium mb-1">Return Shipping</p>
                <p>Free return shipping for defective or wrong items</p>
              </div>
              <div>
                <p className="font-medium mb-1">Refund Methods</p>
                <p>Original payment method, wallet credit, or bank transfer</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left shadow-sm">
                <h3 className="font-medium text-gray-900 mb-1">Start New Return</h3>
                <p className="text-sm text-gray-600">Return an item from your recent orders</p>
              </button>
              <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left shadow-sm">
                <h3 className="font-medium text-gray-900 mb-1">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help with your return request</p>
              </button>
              <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left shadow-sm">
                <h3 className="font-medium text-gray-900 mb-1">Return Status</h3>
                <p className="text-sm text-gray-600">Check the status of your returns</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm">
            © 2025 MyShop — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
