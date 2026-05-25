import { publicAxios } from './axios';
import type { ApiResponse, Address } from '../types';

export interface AddAddressRequest {
  userId: number;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  isDefault?: boolean;
  addressType?: 'HOME' | 'OFFICE' | 'OTHER';
  landmark?: string;
  alternatePhone?: string;
}

export const addressApi = {
  // Get user addresses
  getUserAddresses: async (userId: number): Promise<Address[]> => {
    const response = await publicAxios.get<ApiResponse<Address[]>>(`/api/public/users/${userId}/addresses`);
    return response.data.data;
  },

  // Add new address
  addAddress: async (request: AddAddressRequest): Promise<Address> => {
    const response = await publicAxios.post<ApiResponse<Address>>('/api/public/addresses', request);
    return response.data.data;
  },

  // Update address
  updateAddress: async (addressId: number, request: Partial<AddAddressRequest>): Promise<Address> => {
    const response = await publicAxios.put<ApiResponse<Address>>(`/api/public/addresses/${addressId}`, request);
    return response.data.data;
  },

  // Delete address
  deleteAddress: async (addressId: number): Promise<void> => {
    await publicAxios.delete(`/api/public/addresses/${addressId}`);
  },

  // Set default address
  setDefaultAddress: async (userId: number, addressId: number): Promise<void> => {
    await publicAxios.put(`/api/public/users/${userId}/addresses/${addressId}/default`);
  }
};
