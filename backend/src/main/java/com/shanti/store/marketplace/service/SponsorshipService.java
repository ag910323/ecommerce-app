package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.entity.SponsorshipCampaign;
import com.shanti.store.marketplace.request.SponsorshipCampaignRequest;

public interface SponsorshipService {
	
	SponsorshipCampaign createCampaign(SponsorshipCampaignRequest request) throws Exception;

    void activateCampaign(Long campaignId, Long sellerId) throws Exception;

    void pauseCampaign(Long campaignId, Long sellerId) throws Exception;

    void endCampaign(Long campaignId, Long sellerId) throws Exception;

    void recordSponsoredClick(Long productId) throws Exception;

    List<SponsorshipCampaign> getActiveCampaigns(Long sellerId);

}
