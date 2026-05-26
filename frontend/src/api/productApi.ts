import axios from './axios';
import { publicAxios } from './axios';
import type { 
  ProductRequest, 
  ProductResponse, 
  ApiResponse,
  ProductFilterRequest,
  PagedResponse
} from '../types';

const unwrapApiPayload = <T>(response: unknown): T | undefined => {
  if (!response || typeof response !== 'object') return undefined;
  const body = (response as any).data ?? response;
  return body as T;
};

const normalizeArrayResponse = <T>(payload: unknown): T[] => {
  const body = unwrapApiPayload<unknown>(payload);
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === 'object') {
    if (Array.isArray((body as any).data)) return (body as any).data as T[];
    if (Array.isArray((body as any).content)) return (body as any).content as T[];
  }
  return [];
};

const normalizePagedResponse = <T>(payload: unknown): PagedResponse<T> => {
  const body = unwrapApiPayload<unknown>(payload);
  if (Array.isArray(body)) {
    return {
      content: body as T[],
      page: 0,
      size: body.length,
      totalElements: body.length,
      totalPages: body.length > 0 ? 1 : 0
    };
  }

  if (!body || typeof body !== 'object') {
    return {
      content: [],
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0
    };
  }

  const content = Array.isArray((body as any).content)
    ? (body as any).content as T[]
    : Array.isArray((body as any).data)
      ? (body as any).data as T[]
      : [];

  return {
    content,
    page: typeof (body as any).page === 'number' ? (body as any).page : 0,
    size: typeof (body as any).size === 'number' ? (body as any).size : content.length,
    totalElements: typeof (body as any).totalElements === 'number' ? (body as any).totalElements : content.length,
    totalPages: typeof (body as any).totalPages === 'number' ? (body as any).totalPages : (content.length > 0 ? 1 : 0),
    first: (body as any).first,
    last: (body as any).last
  };
};

export const productApi = {
  // Create a new product (SELLER only)
  createProduct: async (productData: ProductRequest): Promise<ProductResponse> => {
    const response = await axios.post<ApiResponse<ProductResponse>>('/api/products', productData);
    return response.data.data;
  },

  // Get all products (public)
  getAllProducts: async (): Promise<ProductResponse[]> => {
    console.log('Making API call to /api/public/products');
    const response = await publicAxios.get<ApiResponse<ProductResponse[]>>('/api/public/products');
    console.log('API response:', response.data);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Search products (public)
  searchProducts: async (searchQuery: string): Promise<ProductResponse[]> => {
    console.log('Making API call to /api/public/products?search=' + searchQuery);
    const response = await publicAxios.get<ApiResponse<ProductResponse[]>>(`/api/public/products?search=${encodeURIComponent(searchQuery)}`);
    console.log('Search API response:', response.data);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },


  // Get product by ID (public)
  getProductById: async (id: number): Promise<ProductResponse> => {
    const response = await publicAxios.get<ApiResponse<ProductResponse>>(`/api/public/products/${id}`);
    return response.data.data;
  },

  // Update product (SELLER only)
  updateProduct: async (id: number, productData: Partial<ProductRequest>): Promise<ProductResponse> => {
    const response = await axios.put<ApiResponse<ProductResponse>>(`/api/products/${id}`, productData);
    return response.data.data;
  },

  // Delete product (SELLER only)
  deleteProduct: async (id: number): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/api/products/${id}`);
  },

  // Get products by seller (for seller's own products)
  getProductsBySeller: async (sellerId: number): Promise<ProductResponse[]> => {
    const response = await axios.get<ApiResponse<ProductResponse[]>>(`/api/products?sellerId=${sellerId}`);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Get products by category (for customers)
  getProductsByCategory: async (categoryId: number): Promise<ProductResponse[]> => {
    const response = await publicAxios.get<ApiResponse<ProductResponse[]>>(`/api/public/products/category/${categoryId}`);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Get featured products (public) - you can implement this endpoint later
  getFeaturedProducts: async (): Promise<ProductResponse[]> => {
    const response = await publicAxios.get<ApiResponse<ProductResponse[]>>('/api/public/products/featured');
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Filter products with pagination (public)
  filterProducts: async (filterRequest: ProductFilterRequest, config?: any): Promise<PagedResponse<ProductResponse>> => {
    const response = await publicAxios.post<ApiResponse<PagedResponse<ProductResponse>>>('/api/public/products/filter', filterRequest, config);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Filter seller products (for seller's own products with filters) - Use secure endpoint
  filterSellerProducts: async (sellerId: number, filterRequest: Omit<ProductFilterRequest, 'sellerId'>): Promise<PagedResponse<ProductResponse>> => {
    const requestWithSellerId = {
      ...filterRequest,
      sellerId: sellerId
    };
    const response = await axios.post<ApiResponse<PagedResponse<ProductResponse>>>('/api/products/filter', requestWithSellerId);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get sponsored products with filtering (public) - NEW API
  getSponsoredProducts: async (filterRequest?: Partial<ProductFilterRequest>): Promise<PagedResponse<ProductResponse>> => {
    const defaultRequest: ProductFilterRequest = {
      isSponsored: true,
      pagination: {
        page: 0,
        size: 20,
        sortBy: 'sponsorPriority',
        sortDir: 'desc'
      },
      ...filterRequest
    };
    
    console.log('Making API call to /api/public/products/sponsored/filter');
    const response = await publicAxios.post<ApiResponse<PagedResponse<ProductResponse>>>(
      '/api/public/products/sponsored/filter', 
      defaultRequest
    );
    console.log('Sponsored products API response:', response.data);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get seller's sponsored products
  getSellerSponsoredProducts: async (sellerId: number): Promise<ProductResponse[]> => {
    const response = await axios.get<ApiResponse<ProductResponse[]>>(`/api/products/seller/${sellerId}/sponsored`);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Update product sponsorship
  updateProductSponsorship: async (productId: number, sponsorshipData: {
    isSponsored: boolean;
    sponsorPriority?: number;
    sponsorStartDate?: string;
    sponsorEndDate?: string;
    sponsorBudget?: number;
    sponsorCostPerClick?: number;
    partnershipBadge?: string;
    partnershipPriority?: number;
    brandPartnershipLevel?: string;
  }): Promise<ProductResponse> => {
    const response = await axios.put<ApiResponse<ProductResponse>>(`/api/products/${productId}/sponsorship`, sponsorshipData);
    return response.data.data;
  },

  // Get sponsored products (public) - GET endpoint
  getSponsoredProductsPublic: async (): Promise<PagedResponse<ProductResponse>> => {
    console.log('Making API call to /api/public/products/sponsored');
    const response = await publicAxios.get<ApiResponse<PagedResponse<ProductResponse>>>('/api/public/products/sponsored');
    console.log('Sponsored products API response:', response.data);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get deals products (public)
  getDealsProducts: async (): Promise<PagedResponse<ProductResponse>> => {
    console.log('Making API call to /api/public/products/deals/filter');
    const response = await publicAxios.post<ApiResponse<PagedResponse<ProductResponse>>>('/api/public/products/deals/filter', {
      pagination: { page: 0, size: 8 }
    });
    console.log('Deals products API response:', response.data);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get trending products (public)
  getTrendingProducts: async (): Promise<PagedResponse<ProductResponse>> => {
    console.log('Making API call to /api/public/products/trending/filter');
    const response = await publicAxios.post<ApiResponse<PagedResponse<ProductResponse>>>('/api/public/products/trending/filter', {
      pagination: { page: 0, size: 8 }
    });
    console.log('Trending products API response:', response.data);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get recommended products (public)
  getRecommendedProducts: async (): Promise<PagedResponse<ProductResponse>> => {
    console.log('Making API call to /api/public/products/recommended/filter');
    const response = await publicAxios.post<ApiResponse<PagedResponse<ProductResponse>>>('/api/public/products/recommended/filter', {
      pagination: { page: 0, size: 8 }
    });
    console.log('Recommended products API response:', response.data);
    return normalizePagedResponse<ProductResponse>(response.data);
  },

  // Get recent browsed products (authenticated users only)
  getRecentBrowsedProducts: async (userId: number): Promise<ProductResponse[]> => {
    console.log('Making API call to /api/user/browsing/recent');
    const response = await axios.post<ApiResponse<ProductResponse[]>>('/api/user/browsing/recent', {
      userId
    });
    console.log('Recent browsed products API response:', response.data);
    return normalizeArrayResponse<ProductResponse>(response.data);
  },

  // Track product click (fire and forget)
  trackProductClick: async (productId: number, source: string, userId: number): Promise<void> => {
    try {
      await axios.post('/api/user/browsing/click', {
        productId,
        source,
        userId
      });
    } catch (error) {
      // Silently fail - tracking should not break user experience
      console.debug('Failed to track product click:', error);
    }
  }
};
