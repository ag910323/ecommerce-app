import Header from "./Header.tsx";
import CategoryBar from "./CategoryBar.tsx";
import { HiSearch, HiShoppingBag } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { ordersApi } from "../api/ordersApi";
import type { Order } from "../api/ordersApi";
import OrderCard from "../components/OrderCard";

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const orderNotificationShown = useRef(false);
  
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("past 3 months");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [visibleOrders, setVisibleOrders] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setVisibleOrders(8);
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (location.state?.orderConfirmation && location.state?.orderNumber && !orderNotificationShown.current) {
      orderNotificationShown.current = true;
      addNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Order #${location.state.orderNumber} has been created and will be processed soon.`,
        duration: 5000
      });
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location.state, location.pathname, addNotification, navigate]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if user is a seller and call appropriate API
      const isSeller = user.roleNames?.includes("SELLER") ?? false;
      let userOrders: Order[];
      
      if (isSeller) {
        // For sellers, use sellerId from sellerResponse.id
        const sellerId = user.sellerResponse?.id;
        if (!sellerId) {
          console.error('Seller ID not found in user data');
          addNotification({
            type: 'error',
            title: 'Seller Data Error',
            message: 'Unable to load seller information. Please contact support.'
          });
          setOrders([]);
          setLoading(false);
          return;
        }
        userOrders = await ordersApi.getSellerOrders(sellerId);
      } else {
        // For regular users, use user ID to get orders
        userOrders = await ordersApi.getUserOrders(user.id);
      }
      
      setOrders(userOrders ?? []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Orders',
        message: 'Could not load your order history. Please try again.'
      });
      // Set empty array on error to show the empty state
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
    const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
    return dateB - dateA;
  });

  // Filter orders based on debounced search query
  const filteredOrders = sortedOrders.filter(order => {
    const orderNumber = String(order.orderNumber ?? 'N/A').toLowerCase();
    const allItems = order.shipments?.flatMap(shipment => shipment.items) || [];
    const itemMatches = allItems.some(item =>
      String(item.productName ?? 'N/A').toLowerCase().includes(normalizedSearchQuery)
    );

    return (
      normalizedSearchQuery === '' ||
      orderNumber.includes(normalizedSearchQuery) ||
      itemMatches
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
              {user?.roleNames?.includes("SELLER") ? "Seller Dashboard" : "Your Account"}
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-700">
              {user?.roleNames?.includes("SELLER") ? "Seller Orders" : "Your Orders"}
            </span>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">
              {user?.roleNames?.includes("SELLER") ? "Seller Orders" : "Your Orders"}
            </h1>
            
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-2xl">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by order ID or item name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Search orders by order ID or item name</p>
            </div>
          </div>


          {/* Time Frame Selection */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-medium text-gray-900">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} placed in
            </span>
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

          {/* Orders Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Showing</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              Sorted by latest orders first
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm animate-pulse h-40" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <HiShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-5" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No matching orders found</h3>
                <p className="text-gray-600 mb-6">
                  {normalizedSearchQuery ? 'Try a different order number or item name.' : 'You have no orders yet.'}
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.slice(0, visibleOrders).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewOrder={handleViewOrder}
                />
              ))}
            </div>
          )}

          {filteredOrders.length > visibleOrders && !loading && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setVisibleOrders((prev) => prev + 8)}
                className="px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Load more orders
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help with Your Order?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-1">Track Your Package</h3>
                <p className="text-sm text-gray-600">Get real-time updates on your delivery</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-1">Return or Exchange</h3>
                <p className="text-sm text-gray-600">Start a return or exchange request</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-1">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our customer service team</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-12">
        <div className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 text-center cursor-pointer">
          <span className="text-sm">Back to top</span>
        </div>
        
        <div className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-white mb-4">Get to Know Us</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">About MyShop</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">Careers</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Connect with Us</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">Facebook</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">Twitter</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Make Money with Us</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">Sell on MyShop</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white hover:underline">Become an Affiliate</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Let Us Help You</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="text-gray-300 hover:text-white hover:underline">Your Account</Link></li>
                  <li><Link to="/returns" className="text-gray-300 hover:text-white hover:underline">Returns Centre</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 text-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-2 text-sm">
              <a href="#" className="hover:text-white mr-4">Conditions of Use & Sale</a>
              <a href="#" className="hover:text-white mr-4">Privacy Notice</a>
              <a href="#" className="hover:text-white">Interest-Based Ads</a>
            </div>
            <div className="text-xs">
              © 1996-2025, MyShop.com, Inc. or its affiliates
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
