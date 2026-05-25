package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.response.AddressResponse;

public class AddressMapper {

    private AddressMapper() {}

    public static AddressResponse toResponse(Address address) {
    	if (address == null) {
    		return null;
    	}
        return AddressResponse.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .zipCode(address.getZipCode())
                .build();
    }
}
