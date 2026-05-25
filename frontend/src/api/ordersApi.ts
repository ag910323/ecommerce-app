import api from './axios'; // ✅ use authenticated axios
import type { CheckoutRequest } from './cartApi';
import type { ApiResponse } from '../types';

export interface BuyNowRequest {
  userId: number;
  variantId: number;
  quantity: number;
  saveAddress: boolean;
  addressId?: number; // For saved addresses
  address?: {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark?: string;
    addressType: 'HOME' | 'OFFICE' | 'OTHER';
  };
  deliveryAddress?: string; // Keep for backward compatibility
  paymentMethod?: 'CASH_ON_DELIVERY' | 'ONLINE';
}

export interface BuyNowResponse {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: string;
  estimatedDeliveryDate: string;
  items: {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  deliveryAddress: string;
  orderDate: string;
  deliveryDate?: string;
  subtotal?: number;
  totalShipping?: number;
  totalDiscount: number;
  totalPrice: number;
  currency?: string;
  shipments: Shipment[];
}

export interface OrderPreview {
  subtotal: number;
  totalShipping: number;
  totalDiscount: number;
  totalPrice: number;
  currency?: string;
}

export interface Shipment {
  id: number;
  sellerId: number;
  sellerName: string;
  sellerPincode?: string;
  itemsTotal: number;
  shippingCharge: number;
  discount: number;
  finalAmount: number;
  courierPartner?: string;
  trackingId?: string;
  status: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: ShipmentItem[];
}

export interface ShipmentItem {
  productId: number;
  productName: string;
  variantName?: string;
  images?: string[];
  attributes?: Record<string, string>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  productPriceSnapshot?: any;
}

export const ordersApi = {
  // ✅ Get orders by user ID (secured)
  getUserOrders: async (userId: number): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>(`/api/orders/user/${userId}`);
    console.log('GetOrders API Response:', response);
    console.log('Response Data:', response.data);
    console.log('Orders Array:', response.data.data);
    
    // Ensure we return an array, even if data is undefined
    const orders = response.data.data ?? [];
    console.log('Final Orders:', orders);
    
    return orders;
  },

  // ✅ Get orders by seller ID (secured)
  getSellerOrders: async (sellerId: number): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>(`/api/orders/seller/${sellerId}`);
    console.log('GetSellerOrders API Response:', response);
    console.log('Response Data:', response.data);
    console.log('Orders Array:', response.data.data);
    
    // Ensure we return an array, even if data is undefined
    const orders = response.data.data ?? [];
    console.log('Final Seller Orders:', orders);
    
    return orders;
  },

  // ✅ Get order by ID (secured)
  getOrderById: async (orderId: number, sellerId?: number): Promise<Order> => {
    const endpoint = sellerId
      ? `/api/orders/${orderId}/seller/${sellerId}`
      : `/api/orders/${orderId}`;

    const response = await api.get<ApiResponse<Order>>(endpoint);
    return response.data.data;
  },

  // ✅ Buy Now API
  buyNow: async (request: BuyNowRequest): Promise<BuyNowResponse> => {
    const response = await api.post<ApiResponse<BuyNowResponse>>('/api/orders/buy-now', request);
    return response.data.data;
  },

  // ✅ Order preview using the same checkout payload structure
  previewOrder: async (request: CheckoutRequest): Promise<OrderPreview> => {
    const response = await api.post<ApiResponse<OrderPreview>>('/api/orders/preview', request);
    return response.data.data;
  },

  // ✅ Buy Now preview using the same buy-now payload structure
  previewBuyNow: async (request: BuyNowRequest): Promise<OrderPreview> => {
    const response = await api.post<ApiResponse<OrderPreview>>('/api/orders/buy-now/preview', request);
    return response.data.data;
  },

  // ✅ Accept or Reject shipment action
  updateShipmentAction: async (shipmentId: number, sellerId: number, action: 'ACCEPT' | 'REJECT'): Promise<Shipment> => {
    const response = await api.put<ApiResponse<Shipment>>(`/api/orders/shipments/${shipmentId}/action`, {
      sellerId,
      action
    });
    return response.data.data;
  },

  // (Optional - keep commented if not needed)
  // getOrderByNumber: async (orderNumber: string): Promise<Order> => {
  //   const response = await api.get<ApiResponse<Order>>(`/api/orders/number/${orderNumber}`);
  //   return response.data.data;
  // }
};