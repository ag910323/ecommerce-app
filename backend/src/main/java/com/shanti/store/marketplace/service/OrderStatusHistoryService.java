package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.OrderStatusHistoryRequest;
import com.shanti.store.marketplace.response.OrderStatusHistoryResponse;

public interface OrderStatusHistoryService {

    OrderStatusHistoryResponse record(OrderStatusHistoryRequest request);
}