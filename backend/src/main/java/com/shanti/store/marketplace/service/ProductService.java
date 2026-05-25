package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.request.ProductFilterRequest;
import com.shanti.store.marketplace.request.ProductRequest;
import com.shanti.store.marketplace.request.ProductSponsorshipRequest;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.ProductResponse;

public interface ProductService {

	ProductResponse createProduct(ProductRequest request);

	List<ProductResponse> getAllProducts();

	ProductResponse getProductById(Long id);

	ProductResponse updateProduct(Long id, ProductRequest request);

	void deleteProduct(Long id);

	List<ProductResponse> createMultipleProducts(List<ProductRequest> requests);

	List<ProductResponse> getProductsByCategory(Long categoryId);
	
	PagedResponse<ProductResponse> filterProducts(ProductFilterRequest request);

	PagedResponse<ProductResponse> getSponsoredProducts(int limit);
	
	public ProductResponse updateProductSponsorship(Long id, ProductSponsorshipRequest request);
	
	PagedResponse<ProductResponse> getSponsoredProductsFiltered(ProductFilterRequest request);
	
	PagedResponse<ProductResponse> getDealsProducts(ProductFilterRequest request);

	PagedResponse<ProductResponse> getTrendingProducts(ProductFilterRequest request);

	PagedResponse<ProductResponse> getRecommendedProducts(ProductFilterRequest request);

}
