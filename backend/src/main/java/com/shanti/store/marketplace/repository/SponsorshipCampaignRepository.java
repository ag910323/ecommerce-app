package com.shanti.store.marketplace.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.SponsorshipCampaign;

@Repository
public interface SponsorshipCampaignRepository extends JpaRepository<SponsorshipCampaign, Long> {
    
    List<SponsorshipCampaign> findBySellerAccountId(Long sellerId);
    
    List<SponsorshipCampaign> findBySellerAccountIdAndStatus(Long sellerId, SponsorshipCampaign.CampaignStatus status);
    
    @Query("SELECT sc FROM SponsorshipCampaign sc WHERE sc.status = 'ACTIVE' " +
           "AND sc.startDate <= :now AND sc.endDate >= :now")
    List<SponsorshipCampaign> findActiveCampaigns(@Param("now") LocalDateTime now);
    
    @Query("SELECT sc FROM SponsorshipCampaign sc WHERE sc.product.id = :productId " +
           "AND sc.status = 'ACTIVE' AND sc.startDate <= :now AND sc.endDate >= :now")
    Optional<SponsorshipCampaign> findActiveCampaignForProduct(@Param("productId") Long productId, 
                                                               @Param("now") LocalDateTime now);
}