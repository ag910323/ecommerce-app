package com.shanti.store.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.response.BrandPartnershipTypeResponse;
import com.shanti.store.marketplace.service.BrandPartnershipTypeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/brand-partnerships")
@RequiredArgsConstructor
public class PublicBrandPartnershipController {

    private final BrandPartnershipTypeService partnershipTypeService;

    @GetMapping("/types")
    public ResponseEntity<?> getPartnershipTypes() {
        List<BrandPartnershipTypeResponse> types = partnershipTypeService.getAllTypes();
        return ApiResponseBuilder.success(types, "Partnership types retrieved successfully");
    }
}