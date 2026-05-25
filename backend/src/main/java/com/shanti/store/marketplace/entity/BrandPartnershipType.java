package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "brand_partnership_type")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class BrandPartnershipType extends BaseEntity {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Column(unique = true, nullable = false)
    private String name; // BRAND_PARTNER, FEATURED_BRAND, TOP_BRAND, EXCLUSIVE_PARTNER
    
    @Column(nullable = false)
    private String displayName; // "Brand Partner", "Featured Brand", etc.
    
    @Column(nullable = false)
    private String badgeColor; // "bg-blue-500", "bg-gold-500", etc.
    
    @Builder.Default
    private Integer priorityBoost = 0;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal monthlyFee = BigDecimal.ZERO;
    
    @Lob
    private String description;
    
    @Lob
    private String benefits; // JSON string of benefits
}