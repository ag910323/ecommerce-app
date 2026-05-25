package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.SponsorshipCampaign;
import com.shanti.store.marketplace.entity.SponsorshipMetrics;
import com.shanti.store.marketplace.repository.ProductRepository;
import com.shanti.store.marketplace.repository.SponsorshipCampaignRepository;
import com.shanti.store.marketplace.repository.SponsorshipMetricsRepository;
import com.shanti.store.marketplace.request.SponsorshipCampaignRequest;
import com.shanti.store.marketplace.service.SponsorshipService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SponsorshipServiceImpl implements SponsorshipService {
	
	private final SponsorshipCampaignRepository campaignRepository;
    private final ProductRepository productRepository;
    private final SponsorshipMetricsRepository metricsRepository;
    
    @Override
    @Transactional
    public SponsorshipCampaign createCampaign(SponsorshipCampaignRequest request) throws Exception {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new Exception("Product not found"));
            
        if (!product.getSellerAccount().getId().equals(request.getSellerId())) {
            throw new Exception("You don't own this product");
        }
        
        SponsorshipCampaign campaign = SponsorshipCampaign.builder()
            .campaignName(request.getCampaignName())
            .sellerAccount(product.getSellerAccount())
            .product(product)
            .budget(request.getBudget())
            .costPerClick(request.getCostPerClick())
            .dailyBudget(request.getDailyBudget())
            .targetKeywords(request.getTargetKeywords())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .status(SponsorshipCampaign.CampaignStatus.DRAFT)
            .build();
            
        return campaignRepository.save(campaign);
    }
    
    // Activate campaign
    @Override
    @Transactional
    public void activateCampaign(Long campaignId, Long sellerId) throws Exception {
        SponsorshipCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));
            
        if (!campaign.getSellerAccount().getId().equals(sellerId)) {
            throw new Exception("You don't own this campaign");
        }
        
        campaign.setStatus(SponsorshipCampaign.CampaignStatus.ACTIVE);
        campaignRepository.save(campaign);
        
        // Update product sponsorship status
        Product product = campaign.getProduct();
        product.setIsSponsored(true);
        product.setSponsorStartDate(campaign.getStartDate());
        product.setSponsorEndDate(campaign.getEndDate());
        product.setSponsorBudget(campaign.getBudget());
        product.setSponsorCostPerClick(campaign.getCostPerClick());
        product.setSponsorPriority(calculatePriority(campaign));
        
        productRepository.save(product);
    }
    
    // Record click and charge
    @Override
    @Transactional
    public void recordSponsoredClick(Long productId) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        Optional<SponsorshipCampaign> campaignOpt = 
            campaignRepository.findActiveCampaignForProduct(productId, now);
            
        if (campaignOpt.isPresent()) {
            SponsorshipCampaign campaign = campaignOpt.get();
            
            // Check budget
            BigDecimal newCost = campaign.getTotalSpent().add(campaign.getCostPerClick());
            if (newCost.compareTo(campaign.getBudget()) <= 0) {
                // Update campaign metrics
                campaign.setTotalClicks(campaign.getTotalClicks() + 1);
                campaign.setTotalSpent(newCost);
                campaignRepository.save(campaign);
                
                // Update daily metrics
                updateDailyMetrics(campaign, 0, 1, campaign.getCostPerClick());
                
                // Check if budget exhausted
                if (newCost.equals(campaign.getBudget())) {
                    pauseCampaign(campaign.getId(), campaign.getSellerAccount().getId());
                }
            }
        }
    }
    
    // Record impression
    @Transactional
    public void recordSponsoredImpression(Long productId) {
        LocalDateTime now = LocalDateTime.now();
        Optional<SponsorshipCampaign> campaignOpt = 
            campaignRepository.findActiveCampaignForProduct(productId, now);
            
        if (campaignOpt.isPresent()) {
            SponsorshipCampaign campaign = campaignOpt.get();
            campaign.setTotalImpressions(campaign.getTotalImpressions() + 1);
            campaignRepository.save(campaign);
            
            updateDailyMetrics(campaign, 1, 0, BigDecimal.ZERO);
        }
    }
    
    // Get sponsored products for homepage
    public List<Product> getSponsoredProducts(int limit) {
        LocalDateTime now = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findActiveSponsoredProducts(now, pageable).getContent();
    }
    
    private Integer calculatePriority(SponsorshipCampaign campaign) {
        return campaign.getCostPerClick().multiply(new BigDecimal("100")).intValue();
    }
    
    private void updateDailyMetrics(SponsorshipCampaign campaign, int impressions, int clicks, BigDecimal cost) {
        LocalDate today = LocalDate.now();
        
        SponsorshipMetrics metrics = metricsRepository
            .findByCampaignIdAndDate(campaign.getId(), today)
            .orElse(SponsorshipMetrics.builder()
                .campaign(campaign)
                .product(campaign.getProduct())
                .date(today)
                .impressions(0)
                .clicks(0)
                .cost(BigDecimal.ZERO)
                .build());
                
        metrics.setImpressions(metrics.getImpressions() + impressions);
        metrics.setClicks(metrics.getClicks() + clicks);
        metrics.setCost(metrics.getCost().add(cost));
        
        metricsRepository.save(metrics);
    }
    
    @Override
    public void pauseCampaign(Long campaignId, Long sellerId) throws Exception {
        SponsorshipCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new Exception("Campaign not found"));

        if (!campaign.getSellerAccount().getId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized to pause this campaign");
        }

        if (campaign.getStatus() == SponsorshipCampaign.CampaignStatus.ACTIVE) {
            campaign.setStatus(SponsorshipCampaign.CampaignStatus.PAUSED);
//            campaign.setPausedAt(LocalDateTime.now());
            campaignRepository.save(campaign);
        }
    }

    @Override
    public void endCampaign(Long campaignId, Long sellerId) throws Exception {
        SponsorshipCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new Exception("Campaign not found"));

        if (!campaign.getSellerAccount().getId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized to end this campaign");
        }

        campaign.setStatus(SponsorshipCampaign.CampaignStatus.DRAFT);
//        campaign.setEndedAt(LocalDateTime.now());
        campaignRepository.save(campaign);
    }
    
    @Override
    public List<SponsorshipCampaign> getActiveCampaigns(Long sellerId) {
        return campaignRepository.findBySellerAccountIdAndStatus(sellerId, SponsorshipCampaign.CampaignStatus.ACTIVE);
    }
}

