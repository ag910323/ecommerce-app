import { useState, useEffect, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiShoppingBag, HiTruck, HiCheckCircle, HiXCircle, HiChevronRight, HiCheck, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { ordersApi } from "../api/ordersApi";
import type { Order, Shipment, ShipmentItem } from "../api/ordersApi";
import Header from "./Header";
import CategoryBar from "./CategoryBar";

// Reusable Components
const OrderStatus = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return {
          icon: <HiCheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          label: 'Delivered'
        };
      case 'SHIPPED':
        return {
          icon: <HiTruck className="w-5 h-5 text-blue-500" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          label: 'Shipped'
        };
      case 'READY_TO_SHIP':
        return {
          icon: <HiTruck className="w-5 h-5 text-sky-500" />,
          color: 'text-sky-600 bg-sky-50 border-sky-200',
          label: 'Packed'
        };
      case 'ACCEPTED':
        return {
          icon: <HiCheckCircle className="w-5 h-5 text-blue-500" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          label: 'Accepted'
        };
      case 'IN_TRANSIT':
        return {
          icon: <HiTruck className="w-5 h-5 text-indigo-500" />,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          label: 'In Transit'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          icon: <HiTruck className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          label: 'Out for Delivery'
        };
      case 'CREATED':
        return {
          icon: <HiShoppingBag className="w-5 h-5 text-orange-500" />,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          label: 'Order Placed'
        };
      default:
        return {
          icon: <HiXCircle className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          label: 'Processing'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${config.color}`}>
      {config.icon}
      <span className="ml-2">{config.label}</span>
    </div>
  );
};

const OrderProgressTracker = ({ status }: { status: string }) => {
  const steps = [
    { key: 'CREATED', label: 'Order Placed', icon: HiShoppingBag },
    { key: 'SHIPPED', label: 'Shipped', icon: HiTruck },
    { key: 'DELIVERED', label: 'Delivered', icon: HiCheckCircle }
  ];

  const getCurrentStep = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 2;
      case 'SHIPPED': return 1;
      default: return 0;
    }
  };

  const currentStep = getCurrentStep(status);

  return (
    <div className="flex items-center justify-center lg:justify-start space-x-2 mt-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`ml-2 text-xs font-medium ${
              isCurrent ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <HiChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderItem = ({ item }: { item: ShipmentItem }) => {
  const imageSrc = item?.images?.[0] || '/placeholder.png';
  const attributeLabel = item.attributes
    ? Object.entries(item.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ')
    : '';

  return (
    <div className="flex flex-col gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
          <img
            src={imageSrc}
            alt={item.productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.png';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
            {item.productName}
          </h4>
          {item.variantName ? (
            <p className="text-sm text-gray-500 mt-1">
              {item.variantName}
            </p>
          ) : null}
          {attributeLabel ? (
            <p className="text-xs text-gray-500 mt-1">{attributeLabel}</p>
          ) : null}
          <p className="text-sm text-gray-600 mt-3">
            Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            ₹{item.totalPrice.toLocaleString('en-IN')}
          </p>
          {item.discount > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Saved ₹{item.discount.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

type ShipmentAction = 'ACCEPT' | 'REJECT' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED';

const shipmentActionButtonConfig: Record<string, Array<{ action: ShipmentAction; label: string; color: string; icon: ReactNode }>> = {
  CREATED: [
    { action: 'ACCEPT', label: 'Accept', color: 'bg-green-600 hover:bg-green-700', icon: <HiCheck className="w-5 h-5" /> },
    { action: 'REJECT', label: 'Reject', color: 'bg-red-600 hover:bg-red-700', icon: <HiX className="w-5 h-5" /> }
  ],
  ACCEPTED: [
    { action: 'READY_TO_SHIP', label: 'Mark as Packed', color: 'bg-blue-600 hover:bg-blue-700', icon: <HiCheck className="w-5 h-5" /> }
  ],
  READY_TO_SHIP: [
    { action: 'SHIPPED', label: 'Mark as Shipped', color: 'bg-orange-600 hover:bg-orange-700', icon: <HiCheck className="w-5 h-5" /> }
  ],
  SHIPPED: [
    { action: 'DELIVERED', label: 'Mark as Delivered', color: 'bg-green-600 hover:bg-green-700', icon: <HiCheck className="w-5 h-5" /> }
  ]
};

const getShipmentActionButtons = (status?: string) => shipmentActionButtonConfig[status?.toUpperCase() ?? ''] ?? [];

const getShipmentActionLabel = (action: ShipmentAction) => {
  switch (action) {
    case 'ACCEPT': return 'Accepted';
    case 'REJECT': return 'Rejected';
    case 'READY_TO_SHIP': return 'Marked as Packed';
    case 'SHIPPED': return 'Marked as Shipped';
    case 'DELIVERED': return 'Marked as Delivered';
    default: return 'Updated';
  }
};

const ShipmentGroup = ({ 
  shipment, 
  isProcessing = false,
  actionButtons = [],
  onAction,
  isSeller = false
}: { 
  shipment: Shipment;
  isProcessing?: boolean;
  actionButtons?: Array<{ action: ShipmentAction; label: string; color: string; icon: ReactNode }>;
  onAction?: (action: ShipmentAction) => void;
  isSeller?: boolean;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
    {/* Shipment Header */}
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">Sold by</span>
          <span className="text-sm font-semibold text-blue-600">{shipment.sellerName}</span>
        </div>
        <OrderStatus status={shipment.status} />
      </div>
    </div>

    {/* Shipment Items */}
    <div className="px-6 py-4">
      {(shipment?.items ?? []).map((item, index) => (
        <OrderItem
          key={`${shipment?.id}-${index}`}
          item={item}
        />
      ))}
    </div>

    {/* Shipment Summary */}
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items total:</span>
          <span className="font-medium">₹{(shipment?.itemsTotal ?? 0).toLocaleString('en-IN')}</span>
        </div>
        {(shipment?.shippingCharge ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">₹{(shipment?.shippingCharge ?? 0).toLocaleString('en-IN')}</span>
          </div>
        )}
        {(shipment?.discount ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-₹{(shipment?.discount ?? 0).toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300">
          <span>Shipment total:</span>
          <span>₹{(shipment?.finalAmount ?? 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Seller Actions - Show buttons based on current shipment status */}
      {isSeller && actionButtons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-300">
          {actionButtons.map(button => (
            <button
              key={button.action}
              onClick={() => onAction?.(button.action)}
              disabled={isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${button.color}`}
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

const PriceSummary = ({ order }: { order: Order }) => {
  const calculateTotals = () => {
    const subtotal = order.shipments?.reduce((sum, shipment) =>
      sum + ((shipment?.items ?? []).reduce((itemSum, item) => itemSum + (item?.totalPrice ?? 0), 0)), 0
    ) || 0;

    const shipping = order.shipments?.reduce((sum, shipment) => sum + (shipment?.shippingCharge ?? 0), 0) || 0;
    const discount = order?.totalDiscount ?? 0;
    const total = order?.totalPrice ?? 0;

    return { subtotal, shipping, discount, total };
  };

  const { subtotal, shipping, discount, total } = calculateTotals();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span>₹{shipping.toLocaleString('en-IN')}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveryAddress = ({ address }: { address: string }) => {
  const formatAddress = (address: string) => {
    if (!address || address.trim() === '') return 'Address not available';

    // Split by commas and filter out empty/null values
    const parts = address.split(',')
      .map(part => part.trim())
      .filter(part => part && part.toLowerCase() !== 'null' && part !== '');

    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
      <div className="text-gray-700 leading-relaxed">
        {formatAddress(address)}
      </div>
    </div>
  );
};

// Loading Components
const HeaderSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="flex space-x-4">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const ItemsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="px-6 py-4">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SummarySkeleton = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-14"></div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <div className="h-5 bg-gray-200 rounded w-12"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingShipmentId, setProcessingShipmentId] = useState<number | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const isSeller = user?.roleNames?.includes("SELLER") ?? false;
      const sellerId = user?.sellerResponse?.id;

      const orderData = await ordersApi.getOrderById(
        parseInt(orderId),
        isSeller && sellerId ? sellerId : undefined
      );

      setOrder(orderData);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError('Failed to load order details. Please try again.');
      addNotification({
        type: 'error',
        title: 'Failed to Load Order',
        message: 'Could not load order details. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentAction = async (shipmentId: number, action: ShipmentAction) => {
    const isSeller = user?.roleNames?.includes("SELLER") ?? false;
    const sellerId = user?.sellerResponse?.id;

    if (!isSeller || !sellerId) {
      console.error('Unauthorized: User is not a seller or seller ID is missing');
      addNotification({
        type: 'error',
        title: 'Unauthorized',
        message: 'Only sellers can accept or reject shipments.'
      });
      return;
    }

    setProcessingShipmentId(shipmentId);

    try {
      console.log(`Processing shipment action: shipmentId=${shipmentId}, action=${action}`);

      // Call shipment action API
      await ordersApi.updateShipmentAction(shipmentId, sellerId, action as any);

      // Refetch full order data to get updated state from backend
      const isSellerUser = user?.roleNames?.includes("SELLER") ?? false;
      const sellerIdForFetch = user?.sellerResponse?.id;

      const updatedOrderData = await ordersApi.getOrderById(
        parseInt(orderId!),
        isSellerUser && sellerIdForFetch ? sellerIdForFetch : undefined
      );

      // Update state with full order response from backend
      setOrder(updatedOrderData);

      const actionLabel = getShipmentActionLabel(action);
      console.log(`Shipment action successful: ${actionLabel}`);
      addNotification({
        type: 'success',
        title: `Shipment ${actionLabel}`,
        message: `Shipment has been ${actionLabel.toLowerCase()} successfully.`
      });
    } catch (err: any) {
      console.error(`Failed to ${action.toLowerCase()} shipment:`, err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      addNotification({
        type: 'error',
        title: `Failed to ${action} Shipment`,
        message: err.response?.data?.message || `Could not ${action.toLowerCase()} shipment. Please try again.`
      });
    } finally {
      setProcessingShipmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <CategoryBar />
        <main className="flex-1 py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumb */}
            <div className="flex items-center mb-6 text-sm">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <span className="mx-2 text-gray-500">›</span>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <span className="mx-2 text-gray-500">›</span>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Back Button */}
            <div className="h-5 bg-gray-200 rounded w-32 mb-6"></div>

            {/* Header Skeleton */}
            <HeaderSkeleton />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Items */}
              <div className="lg:col-span-2">
                <ItemsSkeleton />
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <SummarySkeleton />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <CategoryBar />
        <main className="flex-1 py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <HiXCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
              <Link
                to="/orders"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <CategoryBar />

      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline">
              {user?.roleNames?.includes("SELLER") ? "Seller Dashboard" : "Your Account"}
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800 hover:underline">
              {user?.roleNames?.includes("SELLER") ? "Seller Orders" : "Your Orders"}
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-700">Order #{order.orderNumber || 'N/A'}</span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber || 'N/A'}
                </h1>
                <p className="text-gray-600 mb-3">
                  Ordered on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <OrderStatus status={order.status} />
              </div>
              <div className="lg:text-right">
                <OrderProgressTracker status={order.status} />
              </div>
            </div>
          </div>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              {order.shipments && order.shipments.length > 0 ? (
                order.shipments.map((shipment) => {
                  const isSeller = user?.roleNames?.includes("SELLER") ?? false;
                  return (
                          <ShipmentGroup
                      key={shipment.id}
                      shipment={shipment}
                      isSeller={isSeller}
                      isProcessing={processingShipmentId === shipment.id}
                      actionButtons={getShipmentActionButtons(shipment.status)}
                      onAction={(action) => handleShipmentAction(shipment.id, action)}
                    />
                  );
                })
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <HiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No items found in this order.</p>
                </div>
              )}
            </div>

            {/* Right Column - Summary & Address */}
            <div className="lg:col-span-1 space-y-6">
              <div className="lg:sticky lg:top-6">
                <PriceSummary order={order} />
                <div className="mt-6">
                  <DeliveryAddress address={order?.deliveryAddress} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}