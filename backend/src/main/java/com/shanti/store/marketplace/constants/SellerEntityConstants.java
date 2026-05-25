package com.shanti.store.marketplace.constants;

public final class SellerEntityConstants {

    private SellerEntityConstants() {}

    public static final String TABLE_NAME = "seller_account";

    public static final String COL_NAME = "name";
    public static final String COL_ID = "seller_account_id"; // for foreign key mapping

    // For relationships
    public static final String MAPPED_BY_PRODUCTS = "seller";
}
