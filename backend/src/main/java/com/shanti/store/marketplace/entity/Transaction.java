package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.shanti.store.marketplace.enums.TransactionStatus;
import com.shanti.store.marketplace.enums.TransactionType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@SuppressWarnings("serial")
public class Transaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_account_id", nullable = false)
    @ToString.Exclude
    private SellerAccount sellerAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment; // traceability

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private LocalDateTime timestamp;
    
}

