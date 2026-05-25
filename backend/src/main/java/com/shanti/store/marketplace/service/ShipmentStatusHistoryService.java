package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.ShipmentStatusHistoryRequest;
import com.shanti.store.marketplace.response.ShipmentStatusHistoryResponse;

public interface ShipmentStatusHistoryService {

    ShipmentStatusHistoryResponse record(ShipmentStatusHistoryRequest request);
}