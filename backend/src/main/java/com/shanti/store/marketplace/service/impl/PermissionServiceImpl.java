package com.shanti.store.marketplace.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Permission;
import com.shanti.store.marketplace.exception.EntityAlreadyExistsException;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.repository.PermissionRepository;
import com.shanti.store.marketplace.request.PermissionRequest;
import com.shanti.store.marketplace.response.PermissionResponse;
import com.shanti.store.marketplace.service.PermissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public PermissionResponse savePermission(PermissionRequest request) {
        Permission permission;

        if (request.getId() == null) {
            if (permissionRepository.existsByName(request.getName())) {
                throw new EntityAlreadyExistsException("Permission already exists with name: " + request.getName());
            }

            permission = Permission.builder()
                    .name(request.getName())
                    .build();
        } else {
            permission = permissionRepository.findById(request.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Permission not found with id: " + request.getId()));

            permissionRepository.findByName(request.getName())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(permission.getId())) {
                            throw new EntityAlreadyExistsException("Permission already exists with name: " + request.getName());
                        }
                    });

            permission.setName(request.getName());
        }

        Permission saved = permissionRepository.save(permission);

        return PermissionResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build();
    }
}
