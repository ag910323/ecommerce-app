package com.shanti.store.marketplace.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentSummaryResponse {

    private String status;
    private String method;

    private BigDecimal totalPaid;
    private BigDecimal totalRefunded;
    private BigDecimal remainingAmount;
}