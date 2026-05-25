package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "brand_partnership")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class BrandPartnership extends BaseEntity {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_type_id", nullable = false)
    private BrandPartnershipType partnershipType;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyFee;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PartnershipStatus status = PartnershipStatus.PENDING;
    
    @Lob
    private String contractTerms;
    
    @Lob
    private String specialBenefits;
    
    public enum PartnershipStatus {
        ACTIVE, PENDING, EXPIRED, CANCELLED
    }
    
    public boolean isCurrentlyActive() {
        LocalDate now = LocalDate.now();
        return status == PartnershipStatus.ACTIVE &&
               startDate.isBefore(now.plusDays(1)) &&
               (endDate == null || endDate.isAfter(now.minusDays(1)));
    }
}
