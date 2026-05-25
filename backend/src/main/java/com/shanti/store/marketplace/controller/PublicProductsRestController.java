package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.ProductFilterRequest;
import com.shanti.store.marketplace.service.ProductService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/public/products")
@CrossOrigin(origins = "*") // optional if CORS is already configured globally
public class PublicProductsRestController {

	private final ProductService productService;

	/**
	 * ✅ Fetch all products (public) Example: GET /api/public/products
	 */
	@GetMapping
	public ResponseEntity<?> getAllProducts() {
		return ApiResponseBuilder.success(productService.getAllProducts(), "Products fetched successfully");
	}

	/**
	 * ✅ Fetch product by ID (public) Example: GET /api/public/products/{id}
	 */
	@GetMapping("/{id}")
	public ResponseEntity<?> getProductById(@PathVariable Long id) {
		return ApiResponseBuilder.success(productService.getProductById(id), "Product fetched successfully");
	}

	/**
	 * ✅ Fetch products by category (public) Example: GET
	 * /api/public/products/category/{categoryId}
	 */
	@GetMapping("/category/{categoryId}")
	public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
		return ApiResponseBuilder.success(productService.getProductsByCategory(categoryId),
				"Products fetched successfully");
	}
	
	@PostMapping("/filter")
	public ResponseEntity<?> filterProducts(@RequestBody ProductFilterRequest request) {
	    return ApiResponseBuilder.success(
	        productService.filterProducts(request),
	        "Filtered products fetched successfully"
	    );
	}

	@GetMapping("/sponsored")
	public ResponseEntity<?> getSponsoredProducts(
			@RequestParam(defaultValue = "8") int limit) {
		return ApiResponseBuilder.success(productService.getSponsoredProducts(limit), 
				"Sponsored products retrieved");
	}
	
	@PostMapping("/sponsored/filter")
	public ResponseEntity<?> getSponsoredProductsFiltered(@RequestBody ProductFilterRequest request) {
		request.setIsSponsored(true); // Force sponsored filter
		return ApiResponseBuilder.success(productService.getSponsoredProductsFiltered(request),
				"Sponsored products fetched successfully");
	}
	
	@PostMapping("/deals/filter")
	public ResponseEntity<?> getDealsProducts(@RequestBody ProductFilterRequest request) {
	    request.setIsDeal(true); // enforce deal logic
	    return ApiResponseBuilder.success(
	            productService.getDealsProducts(request),
	            "Deals products fetched successfully"
	    );
	}

	@PostMapping("/trending/filter")
	public ResponseEntity<?> getTrendingProducts(@RequestBody ProductFilterRequest request) {
	    request.setIsTrending(true); // enforce trending logic
	    return ApiResponseBuilder.success(
	            productService.getTrendingProducts(request),
	            "Trending products fetched successfully"
	    );
	}

	@PostMapping("/recommended/filter")
	public ResponseEntity<?> getRecommendedProducts(@RequestBody ProductFilterRequest request) {
	    return ApiResponseBuilder.success(
	            productService.getRecommendedProducts(request),
	            "Recommended products fetched successfully"
	    );
	}

}

