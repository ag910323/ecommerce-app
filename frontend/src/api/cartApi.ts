import { publicAxios } from './axios';
import api from './axios';
import type { ApiResponse } from '../types';

export interface AddToCartRequest {
  userId: number;
  variantId: number;
  quantity: number;
}

export interface CartItem {
  id: number;
  variantId: number;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  images?: string[];
  attributes?: Record<string, string>;
}

export interface CartResponse {
  id: number;
  userId?: number;
  totalItems: number;
  totalSellingPrice: number;
  totalMRP: number;
  totalDiscount: number;
  items: CartItem[]; // Changed from cartItems to items to match API response
}

export interface CheckoutRequest {
  userId: number;
  addressId?: number; // For saved addresses
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'COD' | 'ONLINE';
  notes?: string;
  items?: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  id: number;
  userId: number;
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

export const cartApi = {
  // Add item to cart
  addToCart: async (request: AddToCartRequest): Promise<CartResponse> => {
    const response = await publicAxios.post<ApiResponse<CartResponse>>('/api/public/cart/add', request);
    return response.data.data;
  },

  // Get cart by user ID
  getCart: async (userId: number): Promise<CartResponse> => {
    const response = await publicAxios.get<ApiResponse<CartResponse>>(`/api/public/cart/${userId}`);
    return response.data.data;
  },

  // Remove item from cart
  removeFromCart: async (userId: number, variantId: number): Promise<CartResponse> => {
    const request = { userId, variantId, quantity: 0 }; // quantity not needed for remove
    const response = await publicAxios.delete<ApiResponse<CartResponse>>('/api/public/cart/remove', { data: request });
    return response.data.data;
  },

  // Update item quantity
  updateQuantity: async (userId: number, variantId: number, quantity: number): Promise<CartResponse> => {
    const request = { userId, variantId, quantity };
    const response = await publicAxios.put<ApiResponse<CartResponse>>('/api/public/cart/update', request);
    return response.data.data;
  },

  // Checkout cart and create order
  checkout: async (request: CheckoutRequest): Promise<OrderResponse> => {
    const response = await api.post<ApiResponse<OrderResponse>>('/api/orders/checkout', request);
    return response.data.data;
  }
};
