package com.shanti.store.marketplace.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RemoveFromCartRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Variant ID is required")
    private Long variantId;
}