package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.request.LoginRequest;
import com.shanti.store.marketplace.request.UserRegistrationRequest;
import com.shanti.store.marketplace.request.VerifyRequest;
import com.shanti.store.marketplace.response.LoginResponse;
import com.shanti.store.marketplace.response.UserResponse;

public interface UserService {

	LoginResponse login(LoginRequest request);
	void verifyUser(VerifyRequest request);
	void sendOtp(VerifyRequest request);
	UserResponse registerUserWithRoles(UserRegistrationRequest request);
	void deleteUser(Long userId);
	boolean existsByEmail(String email);
	boolean existsByUsername(String username);
}
