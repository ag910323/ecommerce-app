package com.shanti.store.marketplace.controller;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.RoleRequest;
import com.shanti.store.marketplace.response.RoleResponse;
import com.shanti.store.marketplace.service.RoleService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleRestController {

    private final RoleService roleService;

    @PostMapping("/save")
    public ResponseEntity<?> saveRole(@RequestBody RoleRequest request) {
        RoleResponse response = roleService.saveRole(request);
        return ApiResponseBuilder.success(response, "Role saved successfully");
    }
}
