package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.UserRegistrationRequest;
import com.shanti.store.marketplace.request.VerifyRequest;
import com.shanti.store.marketplace.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/users")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserService userService;

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyUser(@Valid @RequestBody VerifyRequest request) {
        userService.verifyUser(request);
        return ApiResponseBuilder.success(null, "User verified successfully");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody VerifyRequest request) {
        userService.sendOtp(request);
        return ApiResponseBuilder.success(null, "OTP resent successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        return ApiResponseBuilder.success(userService.registerUserWithRoles(request), "User registered successfully");
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ApiResponseBuilder.success(null, "User deleted successfully");
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ApiResponseBuilder.success(exists, exists ? "Email already exists" : "Email available");
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameExists(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        return ApiResponseBuilder.success(exists, exists ? "Username already exists" : "Username available");
    }
}