package com.shanti.store.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.CategoryRequest;
import com.shanti.store.marketplace.response.ApiResponse;
import com.shanti.store.marketplace.response.CategoryResponse;
import com.shanti.store.marketplace.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryRestController {

    private final CategoryService categoryService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ApiResponseBuilder.success(response, "Category created successfully");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ApiResponseBuilder.success(categories, "Categories retrieved successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ApiResponseBuilder.success(response, "Category fetched successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ApiResponseBuilder.success(response, "Category updated successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponseBuilder.success(null, "Category deleted successfully");
    }
    
    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        List<CategoryResponse> parentCategories = categoryService.getParentCategories();
        return ApiResponseBuilder.success(parentCategories, "Parent categories retrieved successfully");
    }

    @GetMapping("/parent/{parentId}/children")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getChildCategories(@PathVariable Long parentId) {
        List<CategoryResponse> childCategories = categoryService.getChildCategoriesByParentId(parentId);
        return ApiResponseBuilder.success(childCategories, "Child categories retrieved successfully");
    }

}
