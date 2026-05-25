package com.shanti.store.marketplace.entity;

import java.time.LocalDateTime;

import com.shanti.store.marketplace.enums.PaymentAttemptStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAttempt extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    private String gatewayOrderId;
    private String gatewayPaymentId;

    @Enumerated(EnumType.STRING)
    private PaymentAttemptStatus status;

    private String failureReason;

    private LocalDateTime attemptedAt;
}
