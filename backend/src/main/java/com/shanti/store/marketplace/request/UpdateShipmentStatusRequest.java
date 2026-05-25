package com.shanti.store.marketplace.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateShipmentStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;
}