package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.request.CategoryFilter;
import com.shanti.store.marketplace.request.CategoryRequest;
import com.shanti.store.marketplace.response.CategoryResponse;
import com.shanti.store.marketplace.response.PagedResponse;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    List<CategoryResponse> getParentCategories();

    List<CategoryResponse> getChildCategoriesByParentId(Long parentId);
    List<CategoryResponse> filterCategories(String status, Long parentId, String name);
	PagedResponse<CategoryResponse> filterCategories(CategoryFilter filter);

}
