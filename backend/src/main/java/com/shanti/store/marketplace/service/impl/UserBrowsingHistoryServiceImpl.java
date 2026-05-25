package com.shanti.store.marketplace.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.entity.UserBrowsingHistory;
import com.shanti.store.marketplace.mapper.ProductMapper;
import com.shanti.store.marketplace.repository.ProductRepository;
import com.shanti.store.marketplace.repository.UserBrowsingHistoryRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.request.BrowseRequest;
import com.shanti.store.marketplace.response.BrowsingHistoryResponse;
import com.shanti.store.marketplace.response.ProductResponse;
import com.shanti.store.marketplace.service.UserBrowsingHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBrowsingHistoryServiceImpl implements UserBrowsingHistoryService {

    private final UserBrowsingHistoryRepository browsingRepo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private static final int MAX_HISTORY = 50;

    // ✅ RECORD VIEW
    @Override
    @Transactional
    public void recordView(Long userId, BrowseRequest request) {

        UserBrowsingHistory history = getOrCreate(userId, request);

        history.setViewCount(history.getViewCount() + 1);
        history.setLastViewedAt(LocalDateTime.now());
        history.setSource(request.getSource());

        browsingRepo.save(history);

        enforceLimit(userId);
    }

    // ✅ RECORD CLICK
    @Override
    @Transactional
    public void recordClick(Long userId, BrowseRequest request) {

        UserBrowsingHistory history = getOrCreate(userId, request);

        history.setClickCount(history.getClickCount() + 1);
        history.setLastViewedAt(LocalDateTime.now());
        history.setSource(request.getSource());

        browsingRepo.save(history);

        enforceLimit(userId);
    }

    // ✅ GET RECENTLY VIEWED
    @Override
    public List<ProductResponse> getRecentlyViewed(Long userId) {

        return browsingRepo
                .findTop10ByUserIdOrderByLastViewedAtDesc(userId)
                .stream()
                .map(h -> ProductMapper.toResponse(h.getProduct()))
                .collect(Collectors.toList());
    }

    // 🔧 GET OR CREATE
    private UserBrowsingHistory getOrCreate(Long userId, BrowseRequest request) {

        return browsingRepo
                .findByUserIdAndProductId(userId, request.getProductId())
                .orElseGet(() -> createNew(userId, request));
    }

    // 🔧 CREATE NEW
    private UserBrowsingHistory createNew(Long userId, BrowseRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return UserBrowsingHistory.builder()
                .user(user)
                .product(product)
                .viewCount(0)
                .clickCount(0)
                .lastViewedAt(LocalDateTime.now())
                .source(request.getSource())
                .build();
    }

    // 🔧 LIMIT TO LAST 50
    private void enforceLimit(Long userId) {

        List<UserBrowsingHistory> all =
                browsingRepo.findByUserIdOrderByLastViewedAtDesc(userId);

        if (all.size() <= MAX_HISTORY) return;

        List<UserBrowsingHistory> toDelete =
                all.subList(MAX_HISTORY, all.size());

        browsingRepo.deleteAll(toDelete);
    }

}