package com.shanti.store.marketplace.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "brand")
@Data
@EqualsAndHashCode(callSuper=false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Brand extends BaseEntity {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
    
    @Column(nullable = false, unique = true)
    private String name;
    

    @Column(length = 1000)
    private String description;
    
    @Column(length = 500)
    private String logo;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PartnershipLevel partnershipLevel = PartnershipLevel.NONE;
    
    private String partnershipBadge;
    
    @Builder.Default
    private Integer partnershipPriority = 0;
    
    @Builder.Default
    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BrandPartnership> partnerships = new ArrayList<>();
    
    public enum PartnershipLevel {
        NONE, PARTNER, FEATURED, TOP, EXCLUSIVE
    }
    
    // Get current active partnership
    public Optional<BrandPartnership> getCurrentPartnership() {
        return partnerships.stream()
            .filter(BrandPartnership::isCurrentlyActive)
            .findFirst();
    }
}
