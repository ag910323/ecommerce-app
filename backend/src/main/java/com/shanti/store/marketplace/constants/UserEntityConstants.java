package com.shanti.store.marketplace.constants;

/**
 * Constants specific to the User entity.
 */
public final class UserEntityConstants {

    private UserEntityConstants() {
    	throw new UnsupportedOperationException("Utility class");
    }

    public static final String TABLE_NAME = "users";

    public static final String COL_USERNAME = "username";
    public static final int LENGTH_USERNAME = 100;

    public static final String COL_EMAIL = "email";
    public static final int LENGTH_EMAIL = 150;

    public static final String COL_PASSWORD = "password";

    public static final String COL_FIRST_NAME = "first_name";
    public static final String COL_LAST_NAME = "last_name";

    public static final String COL_ROLE = "role"; // e.g., ADMIN, CUSTOMER, SELLER
    
    public static final String MAPPED_BY_ADDRESSES = "user";
    public static final String MAPPED_BY_CART = "user";
    public static final String MAPPED_BY_SELLER = "user";
}

