package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Transaction;
import com.shanti.store.marketplace.response.TransactionResponse;

public class TransactionMapper {
	
	private TransactionMapper() {
		
	}
	
	public static TransactionResponse mapTransaction(Transaction txn) {
	    if (txn == null) return null;

	    return TransactionResponse.builder()
	            .id(txn.getId())
	            .type(txn.getType() != null ? txn.getType().name() : null)
	            .status(txn.getStatus() != null ? txn.getStatus().name() : null)
	            .amount(txn.getAmount())
	            .timestamp(txn.getTimestamp())
	            .paymentId(
	                txn.getPayment() != null ? txn.getPayment().getId() : null
	            )
	            .build();
	}

}
