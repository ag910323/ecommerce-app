package com.shanti.store.marketplace.service.impl;

import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.mapper.OrderStatusHistoryMapper;
import com.shanti.store.marketplace.repository.OrderStatusHistoryRepository;
import com.shanti.store.marketplace.request.OrderStatusHistoryRequest;
import com.shanti.store.marketplace.response.OrderStatusHistoryResponse;
import com.shanti.store.marketplace.service.OrderStatusHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderStatusHistoryServiceImpl implements OrderStatusHistoryService {

    private final OrderStatusHistoryRepository repository;

    @Override
    public OrderStatusHistoryResponse record(OrderStatusHistoryRequest request) {

        if (request.getOldStatus() == request.getNewStatus()) {
            return null;
        }

        var entity = OrderStatusHistoryMapper.toEntity(request);

        var saved = repository.save(entity);

        return OrderStatusHistoryMapper.toResponse(saved);
    }
}