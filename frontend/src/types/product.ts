// Product and Category related types

export interface CategoryRequest {
  name: string;
  description?: string;
  status: string;
  parentCategoryId?: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  status: string;
  parentCategory?: CategoryResponse;
  subCategories?: CategoryResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export type PartnershipLevel = 'NONE' | 'PARTNER' | 'FEATURED' | 'TOP' | 'EXCLUSIVE';

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: number;
  images?: string[];
  attributes?: ProductAttribute[];
  // Sponsorship fields
  isSponsored?: boolean;
  sponsorPriority?: number;
  sponsorStartDate?: string;
  sponsorEndDate?: string;
  sponsorBudget?: number;
  sponsorCostPerClick?: number;
  partnershipBadge?: string;
  partnershipPriority?: number;
  brandPartnershipLevel?: PartnershipLevel;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: CategoryResponse;
  images?: string[];
  attributes?: ProductAttribute[];
  sellerId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Sponsorship fields
  isSponsored?: boolean;
  sponsorPriority?: number;
  sponsorStartDate?: string;
  sponsorEndDate?: string;
  sponsorBudget?: number;
  sponsorCostPerClick?: number;
  partnershipBadge?: string;
  partnershipPriority?: number;
  brandPartnershipLevel?: PartnershipLevel;
  isCurrentlySponsored?: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// Category status options
export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT'
} as const;

export type CategoryStatus = typeof CATEGORY_STATUS[keyof typeof CATEGORY_STATUS];

// Partnership level constants
export const PARTNERSHIP_LEVELS = {
  NONE: 'NONE',
  PARTNER: 'PARTNER',
  FEATURED: 'FEATURED',
  TOP: 'TOP',
  EXCLUSIVE: 'EXCLUSIVE'
} as const;
