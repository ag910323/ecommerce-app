package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.BrowseRequest;
import com.shanti.store.marketplace.response.BrowsingHistoryResponse;
import com.shanti.store.marketplace.response.ProductResponse;

import java.util.List;

public interface UserBrowsingHistoryService {

    void recordView(Long userId, BrowseRequest request);

    void recordClick(Long userId, BrowseRequest request);

    List<ProductResponse> getRecentlyViewed(Long userId);
}