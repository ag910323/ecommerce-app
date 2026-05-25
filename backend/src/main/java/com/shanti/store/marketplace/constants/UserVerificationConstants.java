package com.shanti.store.marketplace.constants;

public class UserVerificationConstants {

	
	private UserVerificationConstants() {
		
	}
	
    public static final String TABLE_NAME = "user_verification";

    public static final String COL_USER = "user_id";
    public static final String COL_VERIFICATION_CODE = "verification_code";
    public static final String COL_EXPIRY = "expiry_datetime";
    public static final String COL_STATUS = "status";
    public static final String COL_ATTEMPTS = "verification_attempts";
    public static final String COL_VERIFIED_AT = "verified_at";
    public static final String COL_VERIFIED_ON_PLATFORM = "verified_on_platform";
    public static final String COL_LOGIN_COUNT = "login_count";
    public static final String COL_FAILED_LOGIN_COUNT = "failed_login_count";
    public static final String COL_LAST_LOGIN_ATTEMPT = "last_login_attempt";

}
