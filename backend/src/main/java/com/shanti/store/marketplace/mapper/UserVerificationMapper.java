package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.UserVerification;
import com.shanti.store.marketplace.response.UserVerificationResponse;

public class UserVerificationMapper {

    private UserVerificationMapper() {
        // private constructor to prevent instantiation
    }

    public static UserVerificationResponse toResponse(UserVerification verification) {
        if (verification == null) {
            return null;
        }

        return UserVerificationResponse.builder()
                .verificationCode(verification.getVerificationCode())
                .status(verification.getStatus())
                .expiryDateTime(verification.getExpiryDateTime())
                .verifiedAt(verification.getVerifiedAt())
                .verifiedOnPlatform(verification.getVerifiedOnPlatform())
                .verificationAttempts(verification.getVerificationAttempts())
                .loginCount(verification.getLoginCount())
                .failedLoginCount(verification.getFailedLoginCount())
                .lastLoginAttempt(verification.getLastLoginAttempt())
                .build();
    }
}
