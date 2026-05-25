package com.shanti.store.marketplace.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyNowRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Builder.Default
    private Integer quantity = 1;

    @Valid
    private AddressRequest address;

    private Boolean saveAddress;
    private String deliveryAddress;
    private Long addressId;

    // Fixed: was "PaymentMethod" (capital P) — renamed to standard camelCase.
    // Jackson maps JSON key "paymentMethod" to this field.
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}