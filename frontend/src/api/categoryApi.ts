import api, { publicAxios } from "./axios";
import type { CategoryRequest, CategoryResponse } from "../types/product";
import type { CategoryFilterRequest, PagedResponse } from "../types";

// Category API endpoints
export const categoryApi = {
  // Get all categories
  getAllCategories: (): Promise<CategoryResponse[]> =>
    api.get("/api/categories").then((r) => {
      // Handle wrapped response structure
      if (r.data.success && r.data.data) {
        return r.data.data; // Return the inner data array
      }
      return r.data; // Fallback to original structure
    }),

  // Filter categories with pagination (PUBLIC endpoint)
  filterCategories: (filter: CategoryFilterRequest): Promise<PagedResponse<CategoryResponse>> =>
    publicAxios.post("/api/public/categories/filter", filter).then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Get only parent categories (top-level categories) - PUBLIC endpoint
  getPublicParentCategories: (): Promise<CategoryResponse[]> =>
    publicAxios.get("/api/public/categories/parents").then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Get only parent categories (top-level categories) - ADMIN endpoint
  getParentCategories: (): Promise<CategoryResponse[]> =>
    api.get("/api/categories/parents").then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Get child categories by parent ID
  getChildCategories: (parentId: number): Promise<CategoryResponse[]> =>
    api.get(`/api/categories/parent/${parentId}/children`).then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Get category by ID
  getCategoryById: (id: number): Promise<CategoryResponse> =>
    api.get(`/api/categories/${id}`).then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Create new category (Admin only)
  createCategory: (data: CategoryRequest): Promise<CategoryResponse> =>
    api.post("/api/categories", data).then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Update category (Admin only)
  updateCategory: (id: number, data: CategoryRequest): Promise<CategoryResponse> =>
    api.put(`/api/categories/${id}`, data).then((r) => {
      if (r.data.success && r.data.data) {
        return r.data.data;
      }
      return r.data;
    }),

  // Delete category (Admin only)
  deleteCategory: (id: number): Promise<void> =>
    api.delete(`/api/categories/${id}`).then((r) => {
      if (r.data.success) {
        return;
      }
      return r.data;
    }),
};
