package com.shanti.store.marketplace.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    private String jwtToken;
    private UserResponse userResponse;
}