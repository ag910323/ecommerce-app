export type RoleType = "CUSTOMER"|"SELLER"|"ADMIN"|"SUPPORT"|"DELIVERY_PARTNER";

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  jwtToken: string;
  userResponse: UserResponse;
}

// Backend wrapper response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Pagination types
export interface PaginationModel {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages?: number;
  last?: boolean;
  first?: boolean;
}

// Product filter request
export interface ProductFilterRequest {
  sellerId?: number;
  categoryIds?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brandIds?: number[];
  statuses?: string[];
  isSponsored?: boolean;
  pagination: PaginationModel;
}

// Category filter request
export interface CategoryFilterRequest {
  name?: string;
  status?: string;
  parentId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

// Partnership types
export type PartnershipLevel = 'NONE' | 'PARTNER' | 'FEATURED' | 'TOP' | 'EXCLUSIVE';

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

export interface BrandPartnership {
  id: number;
  partnershipType: BrandPartnershipType;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  contractTerms?: string;
  specialBenefits?: string;
}

export interface AddressRequest {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userAddresses?: AddressRequest[];
  roles?: RoleType[];
  // seller/delivery fields if sending
  businessName?: string;
  gstNumber?: string;
  // delivery partner nested object if used
  deliveryPartner?: {
    fullName?: string;
    vehicleType?: string;
    vehicleNumber?: string;
    documents?: { documentType: string; documentUrl: string }[];
  };
}

export interface UserResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userStatus: string;
  userType?: string;
  roles: Array<{
    id: number;
    name: string;
    permissions?: any;
  }>;
  roleNames: string[];
  addresses: Address[];
  cartResponse: {
    id: number;
    items: any[];
  };
  userVerificationResponse: {
    verificationCode: string;
    status: string;
    expiryDateTime: string;
    verifiedAt: string;
    verifiedOnPlatform?: string;
    verificationAttempts: number;
    loginCount: number;
    failedLoginCount: number;
    lastLoginAttempt?: string;
  };
  sellerResponse?: any;
  deliveryPartnerResponse?: any;
  active: boolean;
  accountLocked: boolean;
  accountExpired: boolean;
  credentialsExpired: boolean;
}

// Re-export product types
export * from './product';

// Product types and enums
export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED'
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

// Partnership level constants
export const PARTNERSHIP_LEVELS = {
  NONE: 'NONE',
  PARTNER: 'PARTNER',
  FEATURED: 'FEATURED',
  TOP: 'TOP',
  EXCLUSIVE: 'EXCLUSIVE'
} as const;

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  brand?: string; // Keep for backward compatibility
  brandId?: number; // New brand ID field
  brandName?: string; // New brand name field for creating brands on-the-fly
  categoryId: number;
  sellerId: number;
  stockQuantity?: number;
  status?: ProductStatus;
  rating?: number;
  discountPercentage?: number;
  imageUrls?: string[];
  attributes?: Record<string, any>;
  // Sponsorship fields
  isSponsored?: boolean;
  sponsorPriority?: number;
  sponsorStartDate?: string; // ISO string format
  sponsorEndDate?: string; // ISO string format
  sponsorBudget?: number;
  sponsorCostPerClick?: number;
  partnershipBadge?: string;
  partnershipPriority?: number;
  brandPartnershipLevel?: PartnershipLevel;
}

export interface VariantResponse {
  id: number;
  variantName: string;
  attributes: Record<string, any>;
  price: number;
  stockQuantity: number;
  sku?: string;
  images: string[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  brand?: string; // Keep for backward compatibility
  brandId?: number; // New brand ID field
  brandName?: string; // New brand name field
  categoryId?: number; // Add categoryId to the response
  categoryName?: string;
  stockQuantity?: number;
  status: ProductStatus;
  rating?: number;
  discountPercentage?: number;
  sellerName?: string;
  imageUrls?: string[];
  attributes?: Record<string, any>;
  variants?: VariantResponse[];
  // Sponsorship fields
  isSponsored?: boolean;
  sponsorPriority?: number;
  sponsorStartDate?: string; // ISO string format
  sponsorEndDate?: string; // ISO string format
  sponsorBudget?: number;
  sponsorCostPerClick?: number;
  partnershipBadge?: string;
  partnershipPriority?: number;
  brandPartnershipLevel?: PartnershipLevel;
  isCurrentlySponsored?: boolean;
}

export interface Address {
  id: number;
  userId: number;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  addressType?: 'HOME' | 'OFFICE' | 'OTHER';
  landmark?: string;
  alternatePhone?: string;
}
