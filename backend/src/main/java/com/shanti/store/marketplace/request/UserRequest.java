package com.shanti.store.marketplace.request;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserRequest {
	private Long id;
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}

