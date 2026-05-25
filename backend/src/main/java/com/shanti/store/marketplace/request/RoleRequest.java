package com.shanti.store.marketplace.request;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {
	private Long id;
    private String name; 
    private Set<Long> permissionIds; 
}
