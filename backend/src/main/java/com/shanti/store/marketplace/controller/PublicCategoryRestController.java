package com.shanti.store.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.CategoryFilter;
import com.shanti.store.marketplace.response.ApiResponse;
import com.shanti.store.marketplace.response.CategoryResponse;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class PublicCategoryRestController {

	private final CategoryService categoryService;
	
	@GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        List<CategoryResponse> parentCategories = categoryService.getParentCategories();
        return ApiResponseBuilder.success(parentCategories, "Parent categories retrieved successfully");
    }
	
	@PostMapping("/filter")
	public ResponseEntity<ApiResponse<PagedResponse<CategoryResponse>>> filterCategories(
	        @RequestBody CategoryFilter filter) {
	    PagedResponse<CategoryResponse> response = categoryService.filterCategories(filter);
	    return ApiResponseBuilder.success(response, "Filtered categories retrieved successfully");
	}


}
