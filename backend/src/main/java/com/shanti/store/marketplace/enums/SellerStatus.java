package com.shanti.store.marketplace.enums;

public enum SellerStatus {
    PENDING_VERIFICATION,  // Just registered, awaiting verification
    VERIFIED,              // Verified and active
    SUSPENDED,             // Temporarily blocked
    DEACTIVATED            // User/Seller has deactivated their account
}