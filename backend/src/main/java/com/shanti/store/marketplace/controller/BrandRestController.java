package com.shanti.store.marketplace.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.BrandFilterRequest;
import com.shanti.store.marketplace.request.BrandRequest;
import com.shanti.store.marketplace.response.BrandResponse;
import com.shanti.store.marketplace.service.BrandService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandRestController {

	private final BrandService brandService;

	@GetMapping
	public ResponseEntity<?> getAllBrands(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "name") String sortBy,
			@RequestParam(defaultValue = "asc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);
		Page<BrandResponse> brands = brandService.findAll(pageable);

		return ApiResponseBuilder.success(brands, "Brands retrieved successfully");
	}

	@GetMapping("/search")
	public ResponseEntity<?> searchBrands(@RequestParam String name, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "name") String sortBy,
			@RequestParam(defaultValue = "asc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);
		Page<BrandResponse> brands = brandService.findByNameContainingIgnoreCase(name, pageable);

		return ApiResponseBuilder.success(brands, "Brands found successfully");
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getBrandById(@PathVariable Long id) {
		BrandResponse brand = brandService.findById(id);
		return ApiResponseBuilder.success(brand, "Brand retrieved successfully");
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
	public ResponseEntity<?> createBrand(@Valid @RequestBody BrandRequest request) {
		BrandResponse brand = brandService.save(request);
		return ApiResponseBuilder.success(brand, "Brand created successfully");
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
		BrandResponse brand = brandService.update(id, request);
		return ApiResponseBuilder.success(brand, "Brand updated successfully");
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
		brandService.deleteById(id);
		return ApiResponseBuilder.success(null, "Brand deleted successfully");
	}
	
	@PostMapping("/filter")
	public ResponseEntity<?> filterBrands(@RequestBody BrandFilterRequest filterRequest) {
	    
	    Sort sort = filterRequest.getSortDir().equalsIgnoreCase("desc") 
	        ? Sort.by(filterRequest.getSortBy()).descending() 
	        : Sort.by(filterRequest.getSortBy()).ascending();
	    
	    Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);
	    Page<BrandResponse> brands = brandService.filterBrands(filterRequest, pageable);
	    
	    return ApiResponseBuilder.success(brands, "Brands filtered successfully");
	}
	
}