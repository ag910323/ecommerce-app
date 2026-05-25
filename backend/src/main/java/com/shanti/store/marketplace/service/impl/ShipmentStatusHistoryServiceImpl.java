package com.shanti.store.marketplace.service.impl;

import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.mapper.ShipmentStatusHistoryMapper;
import com.shanti.store.marketplace.repository.ShipmentStatusHistoryRepository;
import com.shanti.store.marketplace.request.ShipmentStatusHistoryRequest;
import com.shanti.store.marketplace.response.ShipmentStatusHistoryResponse;
import com.shanti.store.marketplace.service.ShipmentStatusHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentStatusHistoryServiceImpl implements ShipmentStatusHistoryService {

    private final ShipmentStatusHistoryRepository repository;

    @Override
    public ShipmentStatusHistoryResponse record(ShipmentStatusHistoryRequest request) {

        if (request.getOldStatus() == request.getNewStatus()) {
            return null;
        }

        var entity = ShipmentStatusHistoryMapper.toEntity(request);

        var saved = repository.save(entity);

        return ShipmentStatusHistoryMapper.toResponse(saved);
    }
}