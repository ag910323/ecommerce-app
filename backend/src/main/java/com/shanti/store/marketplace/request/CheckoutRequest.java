package com.shanti.store.marketplace.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    // deliveryAddress is optional when addressId is provided — kept optional intentionally.
    // Service layer enforces that at least one of deliveryAddress or addressId is present.
    private String deliveryAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String notes;

    private Long addressId;
}