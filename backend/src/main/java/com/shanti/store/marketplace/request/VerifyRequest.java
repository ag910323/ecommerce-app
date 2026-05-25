package com.shanti.store.marketplace.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    // code is required for verify-otp but optional for resend-otp.
    // Controller-level validation handles this distinction; keeping optional here
    // preserves the resend-otp FE contract (only email needed).
    private String code;
}