package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Role;
import com.shanti.store.marketplace.response.RoleResponse;

public class RoleMapper {

    private RoleMapper() {} 

    public static RoleResponse toResponse(Role role) {
    	if (role == null) {
    		return null;
    	}
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }
}
