package com.shanti.store.marketplace.constants;

public class AppConstants {
	private AppConstants() {}

    public static final String CONTENT_TYPE_JSON = "application/json";
    public static final int UNAUTHORIZED_STATUS = 401;
    
    // JWT Token
    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final long JWT_TOKEN_EXPIRATION = 1000 * 60 * 60;
}

