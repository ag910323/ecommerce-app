package com.shanti.store.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.ProductFilterRequest;
import com.shanti.store.marketplace.request.ProductRequest;
import com.shanti.store.marketplace.request.ProductSponsorshipRequest;
import com.shanti.store.marketplace.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductRestController {

    private final ProductService productService;

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request) {
        return ApiResponseBuilder.success(productService.createProduct(request), "Product created successfully");
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ApiResponseBuilder.success(productService.getAllProducts(), "Products fetched successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return ApiResponseBuilder.success(productService.getProductById(id), "Product fetched successfully");
    }

    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponseBuilder.success(productService.updateProduct(id, request), "Product updated successfully");
    }

    @PreAuthorize("hasRole('SELLER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponseBuilder.success(null, "Product deleted successfully");
    }

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/bulk")
    public ResponseEntity<?> createMultipleProducts(@Valid @RequestBody List<@Valid ProductRequest> requests) {
        return ApiResponseBuilder.success(productService.createMultipleProducts(requests), "Products created successfully");
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        return ApiResponseBuilder.success(productService.getProductsByCategory(categoryId), "Product fetched successfully");
    }

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/filter")
    public ResponseEntity<?> filterProducts(@RequestBody ProductFilterRequest request) {
        return ApiResponseBuilder.success(
                productService.filterProducts(request),
                "Filtered products fetched successfully"
        );
    }

    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/{id}/sponsorship")
    public ResponseEntity<?> updateProductSponsorship(
            @PathVariable Long id,
            @RequestBody ProductSponsorshipRequest request) {
        return ApiResponseBuilder.success(productService.updateProductSponsorship(id, request), "Product sponsorship updated successfully");
    }
}