package com.shanti.store.marketplace.response;

import com.shanti.store.marketplace.enums.UserStatus;
import com.shanti.store.marketplace.enums.UserType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserResponse {
	private Long id;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserStatus userStatus;
    private UserType userType;
    private Set<RoleResponse> roles;
    private Set<String> roleNames;
    private List<AddressResponse> addresses;
    private CartResponse cartResponse;
    private UserVerificationResponse userVerificationResponse;
    private SellerResponse sellerResponse;
    private DeliveryPartnerResponse deliveryPartnerResponse;
    private boolean active;
    private boolean accountLocked;
    private boolean accountExpired;
    private boolean credentialsExpired;
}
