package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.PermissionRequest;
import com.shanti.store.marketplace.response.PermissionResponse;

public interface PermissionService {
    PermissionResponse savePermission(PermissionRequest request);
}
