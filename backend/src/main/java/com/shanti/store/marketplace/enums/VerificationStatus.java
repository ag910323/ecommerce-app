package com.shanti.store.marketplace.enums;

public enum VerificationStatus {
    PENDING,        // User registered but not verified
    VERIFIED,       // Verification successful
    EXPIRED,        // Verification code expired
    FAILED          // Too many failed attempts
}

