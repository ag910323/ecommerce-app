import { HiEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import type { Order } from '../api/ordersApi';

interface OrderCardProps {
  order: Order;
  onViewOrder?: (orderId: string) => void;
}

export default function OrderCard({ order, onViewOrder }: OrderCardProps) {
  const navigate = useNavigate();

  // Extract all items from all shipments
  const allItems = order.shipments?.flatMap(shipment => shipment.items) || [];
  const firstItem = order?.shipments?.[0]?.items?.[0] as any;
  const imageSrc = (firstItem?.images?.[0] as string | undefined) || '/placeholder.png';
  const productName = firstItem?.productName || 'Order Item';
  const variantName = firstItem?.variantName;
  const firstShipmentItemsCount = order?.shipments?.[0]?.items?.length || 0;
  const moreItemsLabel = firstShipmentItemsCount > 1 ? `+${firstShipmentItemsCount - 1} more items` : '';

  // Calculate total items count from all shipments
  const totalItems = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Parse delivery address for compact format
  const parseDeliveryAddress = (address: string) => {
    if (!address || address.trim() === '') {
      return { name: 'Customer', city: '' };
    }

    const parts = address.split(',').map(part => part.trim()).filter(part => part);

    if (parts.length === 0) {
      return { name: 'Customer', city: '' };
    }

    const name = parts[0] || 'Customer';

    // Find city - look for parts that are likely city names
    // Skip very short parts, phone numbers, and obvious non-city parts
    const city = parts.find(part =>
      part &&
      part.length > 2 &&
      !/^\d+$/.test(part) && // not just numbers
      !part.includes('@') && // not email
      !part.toLowerCase().includes('road') &&
      !part.toLowerCase().includes('street') &&
      !part.toLowerCase().includes('lane') &&
      !part.toLowerCase().includes('nagar') &&
      !part.toLowerCase().includes('colony')
    ) || '';

    return { name, city };
  };

  const { name, city } = parseDeliveryAddress(order.deliveryAddress || '');

  const handleViewOrder = () => {
    // Navigate to order details page
    navigate(`/orders/${order.id}`);
    // Also call the optional callback if provided
    onViewOrder?.(order.id.toString());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      {/* Desktop: 3-section horizontal layout, Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SECTION: Product Image & Names */}
        <div className="flex items-start gap-4 lg:w-2/5">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src={imageSrc}
              alt={productName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <p className="text-sm text-gray-900 font-semibold leading-5 line-clamp-2 overflow-hidden text-ellipsis">
                {productName}
              </p>
              {variantName ? (
                <p className="text-xs text-gray-500">{variantName}</p>
              ) : null}
              {moreItemsLabel ? (
                <p className="text-xs text-gray-500">{moreItemsLabel}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Order Details */}
        <div className="flex-1 lg:flex lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Order</p>
              <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-600">
                {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Delivered to</span>
              <span className="font-medium text-gray-900">{name}, {city}</span>
            </div>
          </div>
          
          {/* Price - Desktop: inline with details, Mobile: separate */}
          <div className="lg:text-right lg:ml-6 mt-3 lg:mt-0">
            <p className="text-xl font-bold text-gray-900">
              ₹{(order.totalPrice ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Status & CTA */}
        <div className="flex flex-col items-start lg:items-end gap-3 lg:w-48">
          <StatusBadge status={order.status} />
          <button
            onClick={handleViewOrder}
            className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <HiEye className="w-4 h-4" />
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}