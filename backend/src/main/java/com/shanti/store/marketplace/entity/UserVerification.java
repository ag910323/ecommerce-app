package com.shanti.store.marketplace.entity;

import java.time.LocalDateTime;

import com.shanti.store.marketplace.constants.UserVerificationConstants;
import com.shanti.store.marketplace.enums.LoginPlatform;
import com.shanti.store.marketplace.enums.VerificationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = UserVerificationConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class UserVerification extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = UserVerificationConstants.COL_USER, nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = UserVerificationConstants.COL_VERIFICATION_CODE, nullable = false, length = 100)
    private String verificationCode;

    @Column(name = UserVerificationConstants.COL_EXPIRY)
    private LocalDateTime expiryDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = UserVerificationConstants.COL_STATUS, nullable = false)
    private VerificationStatus status;

    @Column(name = UserVerificationConstants.COL_ATTEMPTS)
    @Builder.Default
    private Integer verificationAttempts = 0;

    @Column(name = UserVerificationConstants.COL_VERIFIED_AT)
    private LocalDateTime verifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = UserVerificationConstants.COL_VERIFIED_ON_PLATFORM)
    private LoginPlatform verifiedOnPlatform;

    @Column(name = UserVerificationConstants.COL_LOGIN_COUNT)
    @Builder.Default
    private Integer loginCount = 0;

    @Column(name = UserVerificationConstants.COL_FAILED_LOGIN_COUNT)
    @Builder.Default
    private Integer failedLoginCount = 0;

    @Column(name = UserVerificationConstants.COL_LAST_LOGIN_ATTEMPT)
    private LocalDateTime lastLoginAttempt;
    
    @Column(name = "otp_sent_at")
    private LocalDateTime otpSentAt;

    @Builder.Default
    @Column(name = "resend_count")
    private int resendCount = 0;

}
