package com.shanti.store.marketplace.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SellerActionRequest {

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @NotBlank(message = "Action is required")
    private String action; // ACCEPT / REJECT / READY_TO_SHIP / SHIPPED / DELIVERED
}