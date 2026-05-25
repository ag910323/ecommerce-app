import api, { publicAxios } from './axios';
import type { PartnershipLevel } from '../types';

export interface BrandResponse {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  partnershipLevel?: PartnershipLevel;
  partnershipBadge?: string;
  partnershipPriority?: number;
  partnerships?: BrandPartnership[];
  currentPartnership?: BrandPartnership;
}

export interface BrandRequest {
  name: string;
  description?: string;
  logo?: string;
  partnershipLevel?: PartnershipLevel;
  partnershipBadge?: string;
  partnershipPriority?: number;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  logo?: string;
}

export interface BrandFilterRequest {
  name?: string;
  description?: string;
  partnershipLevel?: 'NONE' | 'PARTNER' | 'FEATURED' | 'TOP' | 'EXCLUSIVE';
  hasLogo?: boolean;
  isPartner?: boolean;
  partnershipBadge?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface BrandPartnershipType {
  id: number;
  name: string;
  displayName: string;
  badgeColor: string;
  priorityBoost: number;
  monthlyFee: number;
  description?: string;
  benefits?: string;
}

export interface BrandPartnershipRequest {
  brandId: number;
  partnershipTypeId: number;
  startDate: string;
  endDate?: string;
  contractTerms?: string;
  specialBenefits?: string;
}

export interface BrandPartnership {
  id: number;
  brand: BrandResponse;
  partnershipType: BrandPartnershipType;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  contractTerms?: string;
  specialBenefits?: string;
}

export interface PagedBrandResponse {
  content: BrandResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export const brandApi = {
  // PUBLIC ENDPOINTS (No authentication required)
  
  // Get popular brands (for home page - no auth needed)
  getPopularBrands: async (): Promise<BrandResponse[]> => {
    const response = await publicAxios.get('/api/public/brands/popular', {
      params: { size: 8 }
    });
    return response.data.data.content || response.data.data;
  },

  // Get all brands for public browsing (no auth needed)
  getPublicBrands: async (
    page: number = 0,
    size: number = 20
  ): Promise<PagedBrandResponse> => {
    const response = await publicAxios.get('/api/public/brands', {
      params: { page, size, sortBy: 'name', sortDir: 'asc' }
    });
    return response.data.data;
  },

  // Search brands publicly (no auth needed)
  searchPublicBrands: async (
    name: string,
    page: number = 0,
    size: number = 20
  ): Promise<PagedBrandResponse> => {
    const response = await publicAxios.get('/api/public/brands/search', {
      params: { name, page, size, sortBy: 'name', sortDir: 'asc' }
    });
    return response.data.data;
  },

  // AUTHENTICATED ENDPOINTS (Admin/Seller access)
  
  // Get all brands with pagination (admin/seller access)
  getAllBrands: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDir: string = 'asc'
  ): Promise<PagedBrandResponse> => {
    const response = await api.get('/api/brands', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data.data;
  },

  // Search brands by name with pagination (admin/seller access)
  searchBrands: async (
    name: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDir: string = 'asc'
  ): Promise<PagedBrandResponse> => {
    const response = await api.get('/api/brands/search', {
      params: { name, page, size, sortBy, sortDir }
    });
    return response.data.data;
  },

  // Get all brands without pagination (for dropdowns - public access for sellers)
  getAllBrandsSimple: async (): Promise<BrandResponse[]> => {
    const response = await publicAxios.get('/api/public/brands/simple');
    return response.data.data || response.data;
  },

  // Get brand by ID (public access)
  getBrandById: async (id: number): Promise<BrandResponse> => {
    const response = await publicAxios.get(`/api/public/brands/${id}`);
    return response.data.data;
  },

  // Create new brand (public access for sellers)
  createBrandPublic: async (brandRequest: { name: string; description?: string; logo?: string }): Promise<BrandResponse> => {
    const response = await publicAxios.post('/api/public/brands', brandRequest);
    return response.data.data || response.data;
  },

  // Create new brand (admin only)
  createBrand: async (brandRequest: BrandRequest): Promise<BrandResponse> => {
    const response = await api.post('/api/brands', brandRequest);
    return response.data.data;
  },

  // Update brand (admin only)
  updateBrand: async (id: number, brandRequest: BrandRequest): Promise<BrandResponse> => {
    const response = await api.put(`/api/brands/${id}`, brandRequest);
    return response.data.data;
  },

  // Delete brand (admin only)
  deleteBrand: async (id: number): Promise<void> => {
    await api.delete(`/api/brands/${id}`);
  },

  // Filter brands with advanced criteria (admin/seller access)
  filterBrands: async (filterRequest: BrandFilterRequest): Promise<PagedBrandResponse> => {
    const response = await api.post('/api/brands/filter', filterRequest);
    return response.data.data;
  },

  // BRAND PARTNERSHIP ENDPOINTS

  // Get partner brands for homepage (public)
  getPartnerBrands: async (limit: number = 8): Promise<BrandResponse[]> => {
    const response = await publicAxios.get('/api/public/brands/partners', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get partnership types (public)
  getPartnershipTypes: async (): Promise<BrandPartnershipType[]> => {
    const response = await publicAxios.get('/api/public/brand-partnerships/types');
    return response.data.data;
  },

  // Get brands by partnership level (public)
  getBrandsByPartnershipLevel: async (level: string): Promise<BrandResponse[]> => {
    const response = await publicAxios.get(`/api/public/brands/partnership/${level}`);
    return response.data.data;
  },

  // Create brand partnership (admin only)
  createBrandPartnership: async (request: BrandPartnershipRequest): Promise<BrandPartnership> => {
    const response = await api.post('/api/brand-partnerships', request);
    return response.data.data;
  },

  // Get brand partnerships (admin)
  getBrandPartnerships: async (brandId?: number): Promise<BrandPartnership[]> => {
    const params = brandId ? { brandId } : {};
    const response = await api.get('/api/brand-partnerships', { params });
    return response.data.data;
  },

  // Activate brand partnership (admin only)
  activateBrandPartnership: async (partnershipId: number): Promise<void> => {
    await api.put(`/api/brand-partnerships/${partnershipId}/activate`);
  },

  // Cancel brand partnership (admin only)
  cancelBrandPartnership: async (partnershipId: number): Promise<void> => {
    await api.put(`/api/brand-partnerships/${partnershipId}/cancel`);
  }
};
