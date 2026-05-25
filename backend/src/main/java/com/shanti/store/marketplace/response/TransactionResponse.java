package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {

    private Long id;

    private String type;     // CREDIT / DEBIT
    private String status;   // COMPLETED / PENDING / REFUNDED

    private BigDecimal amount;

    private LocalDateTime timestamp;
    private Long paymentId;
}