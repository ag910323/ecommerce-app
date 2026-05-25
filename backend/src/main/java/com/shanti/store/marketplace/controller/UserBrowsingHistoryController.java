package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.BrowseRequest;
import com.shanti.store.marketplace.service.UserBrowsingHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/browsing")
@RequiredArgsConstructor
public class UserBrowsingHistoryController {

    private final UserBrowsingHistoryService browsingService;

    // ✅ VIEW
    @PostMapping("/view")
    public ResponseEntity<?> recordView(@RequestBody BrowseRequest request) {

        browsingService.recordView(request.getUserId(), request);

        return ApiResponseBuilder.success(null, "View recorded");
    }

    // ✅ CLICK
    @PostMapping("/click")
    public ResponseEntity<?> recordClick(@RequestBody BrowseRequest request) {

        browsingService.recordClick(request.getUserId(), request);

        return ApiResponseBuilder.success(null, "Click recorded");
    }

    // ✅ RECENT
    @PostMapping("/recent")
    public ResponseEntity<?> getRecent(@RequestBody BrowseRequest request) {

        return ApiResponseBuilder.success(
                browsingService.getRecentlyViewed(request.getUserId()),
                "Recently viewed products"
        );
    }
}