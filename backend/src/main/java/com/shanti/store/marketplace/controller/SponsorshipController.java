package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.entity.SponsorshipCampaign;
import com.shanti.store.marketplace.request.SponsorshipCampaignRequest;
import com.shanti.store.marketplace.response.ApiResponse;
import com.shanti.store.marketplace.service.SponsorshipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sponsorship")
@RequiredArgsConstructor
public class SponsorshipController {
    
    private final SponsorshipService sponsorshipService;
    
    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SponsorshipCampaign>> createCampaign(
            @RequestBody SponsorshipCampaignRequest request) throws Exception {
        
        SponsorshipCampaign campaign = sponsorshipService.createCampaign(request);
        return ApiResponseBuilder.success(campaign, "Campaign created successfully");
    }
    
    @PutMapping("/campaigns/{id}/activate/{sellerId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> activateCampaign(
            @PathVariable Long id, @PathVariable Long sellerId) throws Exception {
        
        sponsorshipService.activateCampaign(id, sellerId);
        return ApiResponseBuilder.success(null, "Campaign activated successfully");
    }
    
    @PostMapping("/products/{productId}/click")
    public ResponseEntity<ApiResponse<Void>> recordClick(@PathVariable Long productId) throws Exception {
        sponsorshipService.recordSponsoredClick(productId);
        return ApiResponseBuilder.success(null, "Click recorded");
    }
    
    @PostMapping("/products/{productId}/impression")
    public ResponseEntity<ApiResponse<Void>> recordImpression(@PathVariable Long productId) throws Exception {
        sponsorshipService.recordSponsoredClick(productId);
        return ApiResponseBuilder.success(null, "Impression recorded");
    }
}
