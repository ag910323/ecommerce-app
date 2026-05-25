package com.shanti.store.marketplace.constants;

/**
 * Constants specific to the Address entity.
 */
public final class AddressEntityConstants {

    private AddressEntityConstants() {}

    public static final String TABLE_NAME = "addresses";

    public static final String COL_STREET = "street";
    public static final String COL_CITY = "city";
    public static final String COL_STATE = "state";
    public static final String COL_COUNTRY = "country";
    public static final String COL_ZIP_CODE = "zip_code";
    public static final String COL_USER = "user_id"; // Foreign key column
}
