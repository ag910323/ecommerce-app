package com.shanti.store.marketplace.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.Category;
import com.shanti.store.marketplace.mapper.CategoryMapper;
import com.shanti.store.marketplace.repository.CategoryRepository;
import com.shanti.store.marketplace.request.CategoryFilter;
import com.shanti.store.marketplace.request.CategoryRequest;
import com.shanti.store.marketplace.response.CategoryResponse;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.service.CategoryService;
import com.shanti.store.marketplace.specification.CategorySpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.getParentCategoryId() != null) {
            parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }
        Category category = CategoryMapper.toEntity(request, parent);
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        return CategoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));

        Category parent = null;
        if (request.getParentCategoryId() != null) {
            parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setStatus(request.getStatus());
        existing.setParent(parent);

        return CategoryMapper.toResponse(categoryRepository.save(existing));
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id " + id);
        }
        categoryRepository.deleteById(id);
    }
    
    @Override
    public List<CategoryResponse> getParentCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getChildCategoriesByParentId(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> filterCategories(String status, Long parentId, String name) {
        return categoryRepository.filterCategories(status, parentId, name).stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }
    
	@Override
	public PagedResponse<CategoryResponse> filterCategories(CategoryFilter filter) {
		Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(),
				"ASC".equalsIgnoreCase(filter.getDirection()) ? Sort.by(filter.getSortBy()).ascending()
						: Sort.by(filter.getSortBy()).descending());

		Specification<Category> spec = CategorySpecification.filterBy(filter.getStatus(), filter.getParentId(),
				filter.getName());

		Page<Category> page = categoryRepository.findAll(spec, pageable);

		List<CategoryResponse> content = page.getContent().stream().map(CategoryMapper::toResponse).toList();

		return new PagedResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }


}
