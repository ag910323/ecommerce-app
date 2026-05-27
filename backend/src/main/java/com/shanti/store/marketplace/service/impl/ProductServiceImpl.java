package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.Brand;
import com.shanti.store.marketplace.entity.Category;
import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.ProductImage;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.Product_;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.SponsorshipCampaign;
import com.shanti.store.marketplace.enums.ProductStatus;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.mapper.ProductMapper;
import com.shanti.store.marketplace.repository.BrandRepository;
import com.shanti.store.marketplace.repository.CategoryRepository;
import com.shanti.store.marketplace.repository.ProductRepository;
import com.shanti.store.marketplace.repository.SellerRepository;
import com.shanti.store.marketplace.request.PaginationModel;
import com.shanti.store.marketplace.request.ProductFilterRequest;
import com.shanti.store.marketplace.request.ProductRequest;
import com.shanti.store.marketplace.request.ProductSponsorshipRequest;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.ProductResponse;
import com.shanti.store.marketplace.service.ProductService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final BrandRepository brandRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
    	Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        SellerAccount sellerAccount = sellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found"));
        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findByIdAndActiveTrue(request.getBrandId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId()));
        } else if (request.getBrandName() != null && !request.getBrandName().trim().isEmpty()) {
            String brandName = request.getBrandName().trim();
            
            brand = brandRepository.findByNameIgnoreCase(brandName)
                    .orElseGet(() -> {
                        Brand newBrand = Brand.builder()
                                .name(brandName)
                                .description("Auto-created brand")
                                .build();
                        return brandRepository.save(newBrand);
                    });
        }
        Product product = ProductMapper.toEntity(request, category, sellerAccount, brand);

        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getStatus() != null) product.setStatus(ProductStatus.valueOf(request.getStatus()));
        if (request.getRating() != null) product.setRating(request.getRating());
        if (request.getDiscountPercentage() != null) product.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getAttributes() != null) {
            if (product.getAttributes() == null) {
                product.setAttributes(new HashMap<>());
            }
            product.getAttributes().putAll(request.getAttributes());
        }
        if (request.getIsSponsored() != null) product.setIsSponsored(request.getIsSponsored());
        if (request.getSponsorPriority() != null) product.setSponsorPriority(request.getSponsorPriority());
        if (request.getSponsorStartDate() != null) product.setSponsorStartDate(request.getSponsorStartDate());
        if (request.getSponsorEndDate() != null) product.setSponsorEndDate(request.getSponsorEndDate());
        if (request.getSponsorBudget() != null) product.setSponsorBudget(request.getSponsorBudget());
        if (request.getSponsorCostPerClick() != null) product.setSponsorCostPerClick(request.getSponsorCostPerClick());
        if (request.getPartnershipBadge() != null) product.setPartnershipBadge(request.getPartnershipBadge());
        if (request.getPartnershipPriority() != null) product.setPartnershipPriority(request.getPartnershipPriority());
        if (request.getBrandPartnershipLevel() != null) product.setBrandPartnershipLevel(request.getBrandPartnershipLevel());
        
        product.setCategory(category);
        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findByIdAndActiveTrue(request.getBrandId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId()));
        } else if (request.getBrandName() != null && !request.getBrandName().trim().isEmpty()) {
            String brandName = request.getBrandName().trim();
            
            brand = brandRepository.findByNameIgnoreCase(brandName)
                    .orElseGet(() -> {
                        Brand newBrand = Brand.builder()
                                .name(brandName)
                                .description("Auto-created brand")
                                .build();
                        return brandRepository.save(newBrand);
                    });
        }
        product.setBrand(brand);
        
        if (request.getImageUrls() != null) {

            product.getImages().clear();

            List<ProductImage> newImages = request.getImageUrls().stream()
                .map(url -> ProductImage.builder()
                    .product(product)
                    .imageUrl(url.trim())
                    .build()
                )
                .collect(Collectors.toList());

            product.getImages().addAll(newImages);
        }
        
     // ✅ Handle Variants Update (Replace Strategy - Safe)
        if (request.getVariants() != null) {

            // Remove old variants
            product.getVariants().clear();

            // Add new variants
            List<ProductVariant> newVariants = request.getVariants().stream()
                .map(v -> ProductVariant.builder()
                    .product(product)
                    .variantName(v.getVariantName())
                    .attributes(v.getAttributes())
                    .price(v.getPrice())
                    .stockQuantity(v.getStockQuantity())
                    .sku(v.getSku())
                    .images(v.getImages())
                    .build()
                ).collect(Collectors.toList());

            product.getVariants().addAll(newVariants);
        }
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public List<ProductResponse> createMultipleProducts(List<ProductRequest> requests) {
        return requests.stream().map(request -> {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));

            SellerAccount sellerAccount = sellerRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new EntityNotFoundException("Seller not found"));
            Brand brand = null;
            if (request.getBrandId() != null) {
                brand = brandRepository.findByIdAndActiveTrue(request.getBrandId())
                        .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId()));
            } else if (request.getBrandName() != null && !request.getBrandName().trim().isEmpty()) {
                String brandName = request.getBrandName().trim();
                
                brand = brandRepository.findByNameIgnoreCase(brandName)
                        .orElseGet(() -> {
                            Brand newBrand = Brand.builder()
                                    .name(brandName)
                                    .description("Auto-created brand")
                                    .build();
                            return brandRepository.save(newBrand);
                        });
            }

            Product product = ProductMapper.toEntity(request, category, sellerAccount, brand);
            return ProductMapper.toResponse(productRepository.save(product));
        }).collect(Collectors.toList());
    }

	@Override
	public List<ProductResponse> getProductsByCategory(Long categoryId) {
		return productRepository.findByCategoryId(categoryId).stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
	}

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public PagedResponse<ProductResponse> filterProducts(ProductFilterRequest request) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Product> cq = cb.createQuery(Product.class);
		Root<Product> root = cq.from(Product.class);

		// Build predicates for main query
		List<Predicate> predicates = buildPredicates(cb, root, request);

		cq.where(cb.and(predicates.toArray(new Predicate[0])));

		// Sorting
		PaginationModel pagination = request.getPagination();
		String sortBy = pagination != null && pagination.getSortBy() != null ? pagination.getSortBy() : "id";
		boolean desc = pagination != null && "desc".equalsIgnoreCase(pagination.getSortDir());
		cq.orderBy(desc ? cb.desc(root.get(sortBy)) : cb.asc(root.get(sortBy)));

		// Pagination
		var query = entityManager.createQuery(cq);
		int page = (pagination != null && pagination.getPage() != null) ? pagination.getPage() : 0;
		int size = (pagination != null && pagination.getSize() != null) ? pagination.getSize() : 10;

		query.setFirstResult(page * size);
		query.setMaxResults(size);

		List<Product> products = query.getResultList();

		// --- Count Query (use separate root & predicates) ---
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Product> countRoot = countQuery.from(Product.class);
		List<Predicate> countPredicates = buildPredicates(cb, countRoot, request);

		countQuery.select(cb.count(countRoot));
		countQuery.where(cb.and(countPredicates.toArray(new Predicate[0])));
		Long totalElements = entityManager.createQuery(countQuery).getSingleResult();

		// Map entities to responses
		List<ProductResponse> content = products.stream().map(ProductMapper::toResponse).toList();

		return new PagedResponse<>(content, page, size, totalElements);
	}

	/**
	 * Helper to build dynamic predicates for both main and count queries
	 */
	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Product> root, ProductFilterRequest request) {
		List<Predicate> predicates = new ArrayList<>();

		if (request.getSellerId() != null)
			predicates.add(cb.equal(root.get("sellerAccount").get("id"), request.getSellerId()));

		if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
	        predicates.add(root.get("category").get("id").in(request.getCategoryIds()));
	    }

		if (request.getSearch() != null && !request.getSearch().isBlank()) {
			String searchPattern = "%" + request.getSearch().toLowerCase() + "%";
			predicates.add(cb.or(cb.like(cb.lower(root.get("name")), searchPattern),
					cb.like(cb.lower(root.get("description")), searchPattern),
					cb.like(cb.lower(root.get("brand")), searchPattern)));
		}

		if (request.getMinPrice() != null)
			predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));

		if (request.getMaxPrice() != null)
			predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));

		if (request.getBrandIds() != null && !request.getBrandIds().isEmpty()) {
	        predicates.add(root.get("brand").get("id").in(request.getBrandIds()));
	    }

	    if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
	        List<String> nonEmptyStatuses = request.getStatuses().stream()
	            .filter(status -> status != null && !status.isBlank())
	            .toList();
	        if (!nonEmptyStatuses.isEmpty()) {
	            predicates.add(root.get("status").in(nonEmptyStatuses));
	        }
	    }
	    if (request.getMinDiscount() != null) {
	        predicates.add(
	            cb.greaterThanOrEqualTo(
	                root.get("discountPercentage"),
	                BigDecimal.valueOf(request.getMinDiscount())
	            )
	        );
	    }

		return predicates;
	}

	@Override
	public PagedResponse<ProductResponse> getSponsoredProducts(int limit) {
		LocalDateTime now = LocalDateTime.now();
		PageRequest pageable = PageRequest.of(0, limit);

		Page<Product> products = productRepository.findActiveSponsoredProducts(now, pageable);

		List<ProductResponse> responses = products.getContent().stream().map(ProductMapper::toResponse)
				.collect(Collectors.toList());

		return new PagedResponse<>(responses, products.getNumber(), products.getSize(), products.getTotalElements());
	}
	
	@Override
	@Transactional
	public ProductResponse updateProductSponsorship(Long id, ProductSponsorshipRequest request) {
	    Product product = productRepository.findById(id)
	            .orElseThrow(() -> new EntityNotFoundException("Product not found"));

	    if (Boolean.TRUE.equals(request.getIsSponsored())) {
	        product.setIsSponsored(true);

	        if (request.getSponsorStartDate() == null) {
	            product.setSponsorStartDate(LocalDateTime.now());
	        } else {
	            product.setSponsorStartDate(request.getSponsorStartDate());
	        }

	        if (request.getSponsorEndDate() == null) {
	            product.setSponsorEndDate(product.getSponsorStartDate().plusDays(30));
	        } else {
	            product.setSponsorEndDate(request.getSponsorEndDate());
	        }

	        product.setSponsorBudget(request.getSponsorBudget() != null
	                ? request.getSponsorBudget()
	                : BigDecimal.valueOf(1000)); 

	        product.setSponsorCostPerClick(request.getSponsorCostPerClick() != null
	                ? request.getSponsorCostPerClick()
	                : BigDecimal.valueOf(5)); 

	        product.setSponsorPriority(request.getSponsorPriority() != null
	                ? request.getSponsorPriority()
	                : 10);

	        if (product.getBrand() != null) {
	            product.setBrandPartnershipLevel(product.getBrand().getPartnershipLevel());
	            product.setPartnershipBadge(product.getBrand().getPartnershipBadge());
	            product.setPartnershipPriority(product.getBrand().getPartnershipPriority());
	        }

	        String campaignName = "Campaign for " + product.getName() + " - " + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

			SponsorshipCampaign campaign = SponsorshipCampaign.builder()
			       .product(product)
			       .campaignName(campaignName)
			       .startDate(product.getSponsorStartDate())
			       .endDate(product.getSponsorEndDate())
			       .budget(product.getSponsorBudget())
			       .costPerClick(product.getSponsorCostPerClick())
			       .priority(product.getSponsorPriority())
			       .status(SponsorshipCampaign.CampaignStatus.ACTIVE)
			       .active(true) 
			       .sellerAccount(product.getSellerAccount()) 
			       .dailyBudget(
			    		    product.getSponsorBudget()
			    		        .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP)
			    		)
			       .totalSpent(BigDecimal.ZERO)
			       .build();

	        product.getSponsorshipCampaigns().add(campaign);
	    } 
	    else {
	        product.setIsSponsored(false);
	        product.setSponsorEndDate(LocalDateTime.now());
	        for (SponsorshipCampaign campaign : product.getSponsorshipCampaigns()) {
	            if (campaign.getStatus() == SponsorshipCampaign.CampaignStatus.ACTIVE) {
	                campaign.setStatus(SponsorshipCampaign.CampaignStatus.PAUSED);
	                campaign.setActive(false);
	                campaign.setEndDate(LocalDateTime.now());
	            }
	        }
	    }

	    return ProductMapper.toResponse(productRepository.save(product));
	}

	@Override
	public PagedResponse<ProductResponse> getSponsoredProductsFiltered(ProductFilterRequest request) {

	    // Extract pagination and sorting
	    PaginationModel pagination = request.getPagination();
	    Sort sort = Sort.by(
	        pagination.getSortDir().equalsIgnoreCase("desc") 
	            ? Sort.Direction.DESC 
	            : Sort.Direction.ASC,
	        pagination.getSortBy()
	    );
	    Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

	    Specification<Product> spec = (root, query, cb) -> {
	        List<Predicate> predicates = new ArrayList<>();

	        // ✅ Sponsored filter
	        if (request.getIsSponsored() != null && request.getIsSponsored()) {
	            predicates.add(cb.isTrue(root.get(Product_.isSponsored)));
	        }

	        // ✅ Category filter
	        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
	            predicates.add(root.get(Product_.category).get("id").in(request.getCategoryIds()));
	        }

	        // ✅ Seller filter
	        if (request.getSellerId() != null) {
	            predicates.add(cb.equal(root.get(Product_.sellerAccount).get("id"), request.getSellerId()));
	        }

	        // ✅ Brand filter (by ID preferred)
	        if (request.getBrandIds() != null && !request.getBrandIds().isEmpty()) {
	            predicates.add(root.get(Product_.brand).get("id").in(request.getBrandIds()));
	        } else if (request.getBrands() != null && !request.getBrands().isEmpty()) {
	            List<Predicate> brandPredicates = request.getBrands().stream()
	                .filter(b -> b != null && !b.isBlank())
	                .map(b -> cb.like(cb.lower(root.get(Product_.brand).get("name")), "%" + b.toLowerCase() + "%"))
	                .collect(Collectors.toList());
	            if (!brandPredicates.isEmpty()) {
	                predicates.add(cb.or(brandPredicates.toArray(new Predicate[0])));
	            }
	        }

	        // ✅ Search (name, description)
	        if (request.getSearch() != null && !request.getSearch().isBlank()) {
	            String pattern = "%" + request.getSearch().toLowerCase() + "%";
	            predicates.add(cb.or(
	                cb.like(cb.lower(root.get(Product_.name)), pattern),
	                cb.like(cb.lower(root.get(Product_.description)), pattern)
	            ));
	        }

	        // ✅ Price range
			if (request.getMinPrice() != null) {
				predicates.add(
						cb.greaterThanOrEqualTo(root.get(Product_.price), BigDecimal.valueOf(request.getMinPrice())));
			}

			if (request.getMaxPrice() != null) {
				predicates
						.add(cb.lessThanOrEqualTo(root.get(Product_.price), BigDecimal.valueOf(request.getMaxPrice())));
			}

	        // ✅ Statuses
	        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
	            predicates.add(root.get(Product_.status).in(request.getStatuses()));
	        }

			// ✅ Only active sponsorships
			predicates.add(cb.or(cb.isNull(root.get(Product_.sponsorEndDate)),
					cb.greaterThan(root.get(Product_.sponsorEndDate), cb.literal(LocalDateTime.now()))));

	        return cb.and(predicates.toArray(new Predicate[0]));
	    };

	    Page<Product> page = productRepository.findAll(spec, pageable);

	    List<ProductResponse> responses = page.stream()
	        .map(ProductMapper::toResponse)
	        .collect(Collectors.toList());

	    return new PagedResponse<>(
	        responses,
	        pagination.getPage(),
	        pagination.getSize(),
	        page.getTotalElements()
	    );
	}
	
	@Override
	public PagedResponse<ProductResponse> getDealsProducts(ProductFilterRequest request) {

	    if (request.getMinDiscount() == null) {
	        request.setMinDiscount(30); // default
	    }

	    request.setPagination(
	        request.getPagination() != null
	            ? request.getPagination()
	            : new PaginationModel(0, 8, "discountPercentage", "desc")
	    );

	    return filterProducts(request);
	}
	
	@Override
	public PagedResponse<ProductResponse> getTrendingProducts(ProductFilterRequest request) {

	    request.setPagination(
	        request.getPagination() != null
	            ? request.getPagination()
	            : new PaginationModel(0, 8, "createdAt", "desc")
	    );

	    return filterProducts(request);
	}
	
	@Override
	public PagedResponse<ProductResponse> getRecommendedProducts(ProductFilterRequest request) {

	    return new PagedResponse<>(
	            List.of(),
	            0,
	            0,
	            0
	    );
	}

}
