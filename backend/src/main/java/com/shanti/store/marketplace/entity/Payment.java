package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.enums.PaymentMode;
import com.shanti.store.marketplace.enums.PaymentStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments", indexes = {
	    @Index(name = "idx_payment_order", columnList = "order_id")
	})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
	
	@Builder.Default
	@OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PaymentAttempt> attempts = new ArrayList<>();

	@Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(precision = 19, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 19, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String currency;

    // gateway fields
    private String gateway;              // RAZORPAY / STRIPE / PAYTM
    private String gatewayOrderId;       // order id from gateway
    private String gatewayPaymentId;     // payment id
    private String gatewaySignature;     // verification

    private String failureReason;
    
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
}
