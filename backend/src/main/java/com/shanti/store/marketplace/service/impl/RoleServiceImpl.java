package com.shanti.store.marketplace.service.impl;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Permission;
import com.shanti.store.marketplace.entity.Role;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.mapper.RoleMapper;
import com.shanti.store.marketplace.repository.PermissionRepository;
import com.shanti.store.marketplace.repository.RoleRepository;
import com.shanti.store.marketplace.request.RoleRequest;
import com.shanti.store.marketplace.response.RoleResponse;
import com.shanti.store.marketplace.service.RoleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

	private final RoleRepository roleRepository;
	private final PermissionRepository permissionRepository;

	@Override
	@Transactional
	public RoleResponse saveRole(RoleRequest request) {
		Set<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds()).stream()
				.collect(Collectors.toSet());
		if (permissions.size() != request.getPermissionIds().size()) {
			throw new EntityNotFoundException("Some permissions not found");
		}
		Role role = Role.builder().name(request.getName()).permissions(permissions).build();
		return RoleMapper.toResponse(roleRepository.save(role));
	}
}
