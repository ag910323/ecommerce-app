package com.shanti.store.marketplace.response;

import java.time.LocalDateTime;

import com.shanti.store.marketplace.enums.VerificationStatus;
import com.shanti.store.marketplace.enums.LoginPlatform;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserVerificationResponse {
    private String verificationCode;
    private VerificationStatus status;
    private LocalDateTime expiryDateTime;
    private LocalDateTime verifiedAt;
    private LoginPlatform verifiedOnPlatform;
    private Integer verificationAttempts;
    private Integer loginCount;
    private Integer failedLoginCount;
    private LocalDateTime lastLoginAttempt;
}
