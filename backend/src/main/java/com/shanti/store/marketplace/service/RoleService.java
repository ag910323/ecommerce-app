package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.RoleRequest;
import com.shanti.store.marketplace.response.RoleResponse;

public interface RoleService {
    RoleResponse saveRole(RoleRequest request);
}
