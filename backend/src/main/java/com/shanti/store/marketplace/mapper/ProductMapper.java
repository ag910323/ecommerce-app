package com.shanti.store.marketplace.mapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Brand;
import com.shanti.store.marketplace.entity.Category;
import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.ProductImage;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.enums.ProductStatus;
import com.shanti.store.marketplace.request.ProductRequest;
import com.shanti.store.marketplace.response.ProductResponse;
import com.shanti.store.marketplace.response.ProductVariantResponse;
import com.shanti.store.marketplace.response.ReviewResponse;

public class ProductMapper {

	private ProductMapper() {

	}

	private static List<ProductVariant> prepareVariants(ProductRequest request, Product product) {

	    // If variants are provided → map normally
	    if (request.getVariants() != null && !request.getVariants().isEmpty()) {
	        return request.getVariants().stream().map(variantReq -> {
	            ProductVariant variant = new ProductVariant();

	            variant.setVariantName(variantReq.getVariantName());
	            variant.setPrice(variantReq.getPrice());
	            variant.setStockQuantity(variantReq.getStockQuantity());
	            variant.setSku(variantReq.getSku());
	            variant.setImages(variantReq.getImages());
	            variant.setAttributes(variantReq.getAttributes());

	            variant.setProduct(product);
	            return variant;
	        }).toList();
	    }

	    ProductVariant defaultVariant = new ProductVariant();

	    defaultVariant.setVariantName(request.getName());
	    defaultVariant.setPrice(request.getPrice());
	    defaultVariant.setStockQuantity(request.getStockQuantity());
	    defaultVariant.setSku(request.getSku());
	    defaultVariant.setAttributes(request.getAttributes());
	    
	    if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
	        defaultVariant.setImages(request.getImageUrls());
	    }

	    defaultVariant.setProduct(product);

	    return List.of(defaultVariant);
	}
	
	public static Product toEntity(ProductRequest request, Category category, SellerAccount sellerAccount,
			Brand brand) {

		Product product = Product.builder().name(request.getName()).description(request.getDescription())
				.price(request.getPrice()).sku(request.getSku()).category(category).brand(brand)
//				.stockQuantity(request.getStockQuantity())
				.status(ProductStatus.valueOf(request.getStatus()))
				.rating(request.getRating()).discountPercentage(request.getDiscountPercentage())
				.sellerAccount(sellerAccount).attributes(request.getAttributes())

				.weight(request.getWeight())
				.length(request.getLength())
				.width(request.getWidth())
				.height(request.getHeight())

				.isSponsored(request.getIsSponsored()).sponsorPriority(request.getSponsorPriority())
				.sponsorStartDate(request.getSponsorStartDate()).sponsorEndDate(request.getSponsorEndDate())
				.sponsorBudget(request.getSponsorBudget()).sponsorCostPerClick(request.getSponsorCostPerClick())
				.partnershipBadge(request.getPartnershipBadge()).partnershipPriority(request.getPartnershipPriority())
				.brandPartnershipLevel(request.getBrandPartnershipLevel())

				.build();

		if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
			product.setImages(request.getImageUrls().stream()
					.map(url -> ProductImage.builder().product(product).imageUrl(url).build())
					.collect(Collectors.toList()));
		}
		product.setVariants(prepareVariants(request, product));

		return product;
	}

	public static ProductResponse toResponse(Product product) {

	    // ===== Pricing Calculations =====
	    BigDecimal price = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;

	    BigDecimal discount = product.getDiscountPercentage() != null
	            ? product.getDiscountPercentage()
	            : BigDecimal.ZERO;

	    BigDecimal originalPrice = BigDecimal.ZERO;
	    BigDecimal discountAmount = BigDecimal.ZERO;

	    if (discount.compareTo(BigDecimal.ZERO) > 0) {
	        originalPrice = price.divide(
	                BigDecimal.ONE.subtract(
	                        discount.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
	                ),
	                2,
	                RoundingMode.HALF_UP
	        );
	        discountAmount = originalPrice.subtract(price);
	    }

	    // ===== Reviews (Top 5 Only) =====
	    List<ReviewResponse> reviews = product.getReviews() != null
	            ? product.getReviews().stream()
	                .limit(5)
	                .map(ReviewMapper::toResponse)
	                .collect(Collectors.toList())
	            : List.of();
	    
	    List<ProductVariantResponse> variants = product.getVariants() != null
	            ? product.getVariants().stream()
	                .map(ProductVariantMapper::toResponse)
	                .collect(Collectors.toList())
	            : List.of();

	    int reviewCount = product.getReviews() != null ? product.getReviews().size() : 0;

	    // ===== Stock Status =====
	    String stockStatus;
	    boolean isLowStock = false;

	    int totalStock = (product.getVariants() != null && !product.getVariants().isEmpty())
	            ? product.getVariants().stream()
	                .map(ProductVariant::getStockQuantity)
	                .filter(Objects::nonNull)
	                .reduce(0, Integer::sum)
	            : 0;

	    if (totalStock == 0) {
	        stockStatus = "OUT_OF_STOCK";
	    } else if (totalStock < 5) {
	        stockStatus = "LOW_STOCK";
	        isLowStock = true;
	    } else {
	        stockStatus = "IN_STOCK";
	    }

	    // ===== Images =====
	    String primaryImage = null;
	    List<String> thumbnailImages = null;

	    if (product.getImages() != null && !product.getImages().isEmpty()) {
	        primaryImage = product.getImages().get(0).getImageUrl();

	        thumbnailImages = product.getImages().stream()
	                .skip(1)
	                .map(ProductImage::getImageUrl)
	                .collect(Collectors.toList());
	    }

	    // ===== Highlights =====
	    List<String> highlights = product.getDescription() != null
	            ? Arrays.stream(product.getDescription().split("\n"))
	                .limit(5)
	                .map(String::trim)
	                .collect(Collectors.toList())
	            : List.of();
	    
	    BigDecimal displayPrice = (product.getVariants() != null && !product.getVariants().isEmpty())
	            ? product.getVariants().stream()
	                .map(v -> v.getPrice() != null ? v.getPrice() : product.getPrice())
	                .filter(p -> p != null)
	                .min(BigDecimal::compareTo)
	                .orElse(BigDecimal.ZERO)
	            : (product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO);
	    
	    return ProductResponse.builder()
	            .id(product.getId())
	            .name(product.getName())
	            .description(product.getDescription())
	            .price(displayPrice)
	            .sku(product.getSku())
	            .variants(variants)

	            // ===== Pricing =====
	            .originalPrice(originalPrice)
	            .discountAmount(discountAmount)
	            .discountPercentage(product.getDiscountPercentage())

	            // ===== Category =====
	            .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
	            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)

	            // ===== Stock =====
	            .stockQuantity(totalStock)
	            .stockStatus(stockStatus)
	            .isLowStock(isLowStock)

	            // ===== Rating & Reviews =====
	            .rating(product.getRating() != null ? product.getRating() : 0.0)
	            .reviewCount(reviewCount)
	            .reviews(reviews)

	            // ===== Seller =====
	            .sellerName(product.getSellerAccount() != null
	                    ? product.getSellerAccount().getName() : null)

	            // ===== Dimensions =====
	            .weight(product.getWeight())
	            .length(product.getLength())
	            .width(product.getWidth())
	            .height(product.getHeight())

	            // ===== Images =====
	            .primaryImage(primaryImage)
	            .thumbnailImages(thumbnailImages)
	            .imageUrls(product.getImages() != null
	                    ? product.getImages().stream()
	                        .map(ProductImage::getImageUrl)
	                        .collect(Collectors.toList())
	                    : List.of())

	            // ===== Brand =====
	            .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
	            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
	            .brandResponse(BrandMapper.toResponse(product.getBrand()))

	            // ===== Attributes =====
	            .attributes(product.getAttributes())

	            // ===== Highlights =====
	            .highlights(highlights)

	            // ===== Sponsorship =====
	            .isSponsored(product.getIsSponsored())
	            .sponsorPriority(product.getSponsorPriority())
	            .sponsorStartDate(product.getSponsorStartDate())
	            .sponsorEndDate(product.getSponsorEndDate())
	            .sponsorBudget(product.getSponsorBudget())
	            .sponsorCostPerClick(product.getSponsorCostPerClick())
	            .partnershipBadge(product.getPartnershipBadge())
	            .partnershipPriority(product.getPartnershipPriority())
	            .brandPartnershipLevel(product.getBrandPartnershipLevel())
	            .isCurrentlySponsored(product.isCurrentlySponsored())

	            // ===== Status =====
	            .status(product.getStatus() != null ? product.getStatus().name() : null)

	            .build();
	}
	
}
