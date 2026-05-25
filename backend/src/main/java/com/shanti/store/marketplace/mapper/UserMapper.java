package com.shanti.store.marketplace.mapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Role;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.response.AddressResponse;
import com.shanti.store.marketplace.response.CartResponse;
import com.shanti.store.marketplace.response.DeliveryPartnerResponse;
import com.shanti.store.marketplace.response.SellerResponse;
import com.shanti.store.marketplace.response.UserResponse;
import com.shanti.store.marketplace.response.UserVerificationResponse;

public class UserMapper {

	private UserMapper() {

	}

	public static UserResponse toResponse(User user) {
		if (user == null) {
			return null;
		}
		Set<com.shanti.store.marketplace.response.RoleResponse> roles = user.getRoles() == null ? Set.of()
				: user.getRoles().stream().map(RoleMapper::toResponse).collect(Collectors.toSet());
		
		Set<String> roleNames = user.getRoles() == null ? Set.of()
		        : user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

		List<AddressResponse> addresses = user.getAddresses() == null ? List.of()
				: user.getAddresses().stream().map(AddressMapper::toResponse).collect(Collectors.toList());

		CartResponse cartResponse = user.getCart() == null ? null : CartMapper.toResponse(user.getCart());
		UserVerificationResponse userVerificationResponse = UserVerificationMapper.toResponse(user.getVerification());
		SellerResponse sellerResponse = user.getSellerAccount() == null ? null : SellerMapper.toResponse(user.getSellerAccount());
		DeliveryPartnerResponse deliveryPartnerResponse = user.getDeliveryPartner() == null ? null
		        : DeliveryPartnerMapper.toResponse(user.getDeliveryPartner());
		
		return UserResponse.builder().id(user.getId()).userId(user.getId()).username(user.getUsername()).email(user.getEmail())
				.firstName(user.getFirstName()).lastName(user.getLastName()).userStatus(user.getUserStatus())
				.roles(roles).addresses(addresses).cartResponse(cartResponse).roleNames(roleNames)
				.active(user.isActive()).accountLocked(user.isAccountLocked()).accountExpired(user.isAccountExpired())
				.credentialsExpired(user.isCredentialsExpired()).userVerificationResponse(userVerificationResponse)
				.sellerResponse(sellerResponse).deliveryPartnerResponse(deliveryPartnerResponse)
				.build();
	}
}
