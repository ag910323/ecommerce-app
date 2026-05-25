package com.shanti.store.marketplace.mapper;

import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Category;
import com.shanti.store.marketplace.request.CategoryRequest;
import com.shanti.store.marketplace.response.CategoryResponse;

public class CategoryMapper {
	
	private CategoryMapper() {
		
	}

	public static Category toEntity(CategoryRequest request, Category parentCategory) {
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .parent(parentCategory)
                .build();
    }

    public static CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .parentCategoryId(category.getParent() != null ? category.getParent().getId() : null)
                .parentCategoryName(category.getParent() != null ? category.getParent().getName() : null)
                .subCategories(
                        category.getSubCategories() != null
                                ? category.getSubCategories()
                                        .stream()
                                        .map(CategoryMapper::toResponse)
                                        .collect(Collectors.toList())
                                : null
                )
                .build();
    }
	
}
