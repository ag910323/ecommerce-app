package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.PermissionRequest;
import com.shanti.store.marketplace.response.PermissionResponse;
import com.shanti.store.marketplace.service.PermissionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionRestController {

    private final PermissionService permissionService;

    @PostMapping("/save")
    public ResponseEntity<?> savePermission(@RequestBody PermissionRequest request) {
        PermissionResponse response = permissionService.savePermission(request);
        return ApiResponseBuilder.success(response, "Permission saved successfully");
    }
}
