import axios from './axios';
import type { PaginationModel } from '../types';

export interface WishlistCreateRequest {
  userId: number;
  name: string;
  description?: string;
}

export interface WishlistFilterRequest {
  wishlistId: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  brandIds?: number[];
  pagination: PaginationModel;
}

export interface WishlistFilterItemsRequest {
  userId: number;
  wishlistId?: number;
}

export interface SimpleWishlistFilterRequest {
  userId: number;
}

export interface WishlistItemResponse {
  productId: number;
  name: string;
  brandName?: string;
  price?: number;
  addedDate: string;
}

export interface WishlistResponse {
  wishlistId: number;
  name: string;
  isDefault?: boolean;
  items: WishlistItemResponse[];
}

export interface PagedWishlistResponse {
  content: WishlistItemResponse[];
  page: number;
  size: number;
  totalElements: number;
}

export const wishlistApi = {
  // Create a new wishlist
  createWishlist: async (request: WishlistCreateRequest): Promise<WishlistResponse> => {
    const response = await axios.post('/api/wishlists/create', request);
    return response.data.data;
  },

  // Get all wishlists for a user
  getUserWishlists: async (userId: number): Promise<WishlistResponse[]> => {
    const response = await axios.get(`/api/wishlists/user/${userId}`);
    return response.data.data;
  },

  // Add product to a wishlist (new API: userId, wishlistId, productId in body)
  addToWishlist: async (userId: number, productId: number, wishlistId?: number): Promise<WishlistResponse> => {
    const response = await axios.post('/api/wishlists/add', {
      userId,
      productId,
      wishlistId: wishlistId ?? null
    });
    return response.data.data;
  },

  // Remove product from wishlist
  removeFromWishlist: async (wishlistId: number, productId: number): Promise<WishlistResponse> => {
    const response = await axios.delete(`/api/wishlists/${wishlistId}/remove/${productId}`);
    return response.data.data;
  },

  // Check if product is in wishlist
  isProductInWishlist: async (wishlistId: number, productId: number): Promise<boolean> => {
    const response = await axios.get(`/api/wishlists/${wishlistId}/contains/${productId}`);
    return response.data.data;
  },

  // Filter and paginate wishlist items
  filterWishlist: async (request: WishlistFilterRequest): Promise<PagedWishlistResponse> => {
    const response = await axios.post('/api/wishlists/filter', request);
    return response.data.data;
  },

  // Simple filter to get all wishlist items for a user
  getUserWishlistItems: async (request: SimpleWishlistFilterRequest): Promise<WishlistItemResponse[]> => {
    const response = await axios.post('/api/wishlists/filter', request);
    return response.data.data.content;
  },

  // Filter wishlist items by user and optional wishlistId
  getWishlistItems: async (request: WishlistFilterItemsRequest): Promise<WishlistItemResponse[]> => {
    const response = await axios.post('/api/wishlists/filter', request);
    const content = response.data.data.content;

    if (Array.isArray(content) && content.length > 0 && 'items' in content[0]) {
      return (content[0] as WishlistResponse).items || [];
    }

    return Array.isArray(content) ? (content as WishlistItemResponse[]) : [];
  }
};
