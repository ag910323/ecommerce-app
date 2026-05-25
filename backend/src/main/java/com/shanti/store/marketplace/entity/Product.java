package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.shanti.store.marketplace.constants.ProductEntityConstants;
import com.shanti.store.marketplace.enums.ProductStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = ProductEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Product extends BaseEntity {

	@Column(name = ProductEntityConstants.COL_NAME, nullable = false, length = ProductEntityConstants.LENGTH_NAME)
	private String name;

	@Lob
	@Column(name = ProductEntityConstants.COL_DESCRIPTION, columnDefinition = "TEXT")
	private String description;

	@Column(name = ProductEntityConstants.COL_PRICE, nullable = false)
	private BigDecimal price;

	@Column(name = ProductEntityConstants.COL_SKU, unique = true, length = ProductEntityConstants.LENGTH_SKU)
	private String sku;

	private Double weight;
	
	private Double length;
	
	private Double width;
	
	private Double height;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = ProductEntityConstants.COL_CATEGORY_ID, nullable = false)
	@ToString.Exclude
	private Category category;

	@Enumerated(EnumType.STRING)
	private ProductStatus status;
	
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProductVariant> variants = new ArrayList<>();

	@OneToMany(mappedBy = ProductEntityConstants.MAPPED_BY_IMAGES, cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	@Builder.Default
	private List<ProductImage> images = new ArrayList<>();

	@Column(name = ProductEntityConstants.COL_RATING)
	private Double rating;

	@Column(name = ProductEntityConstants.COL_DISCOUNT_PERCENTAGE)
	private BigDecimal discountPercentage;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = ProductEntityConstants.COL_SELLER, nullable = false)
	@ToString.Exclude
	private SellerAccount sellerAccount;

	@OneToMany(mappedBy = ProductEntityConstants.MAPPED_BY_REVIEWS, cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	@Builder.Default
	private List<Review> reviews = new ArrayList<>();
	
	@ElementCollection
    @CollectionTable(name = "product_attributes", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "attribute_key")
    @Column(name = "attribute_value")
	@Builder.Default
	private Map<String, String> attributes = new HashMap<>();

	@Builder.Default
	@Column(name = "is_sponsored")
	private Boolean isSponsored = false;
	
	@Builder.Default
	@Column(name = "sponsor_priority")
	private Integer sponsorPriority = 0;
	
	@Column(name = "sponsor_start_date")
	private LocalDateTime sponsorStartDate;
	
	@Column(name = "sponsor_end_date")
	private LocalDateTime sponsorEndDate;
	
	@Column(name = "sponsor_budget", precision = 10, scale = 2)
	private BigDecimal sponsorBudget;
	
	@Column(name = "sponsor_cost_per_click", precision = 10, scale = 2)
	private BigDecimal sponsorCostPerClick;
	
	@Column(name = "partnership_badge")
	private String partnershipBadge;

	@Builder.Default
	@Column(name = "partnership_priority")
	private Integer partnershipPriority = 0;

	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(name = "brand_partnership_level")
	private Brand.PartnershipLevel brandPartnershipLevel = Brand.PartnershipLevel.NONE;
	
	@Builder.Default
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<SponsorshipCampaign> sponsorshipCampaigns = new ArrayList<>();
	
	public boolean isCurrentlySponsored() { 
		LocalDateTime now = LocalDateTime.now(); return isSponsored != null && 
				isSponsored && sponsorStartDate != null && 
				sponsorStartDate.isBefore(now) && sponsorEndDate != null 
				&& sponsorEndDate.isAfter(now); 
		} 
}

