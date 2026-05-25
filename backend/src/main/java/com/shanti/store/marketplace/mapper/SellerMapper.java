package com.shanti.store.marketplace.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.SellerAddress;
import com.shanti.store.marketplace.entity.SellerBankDetail;
import com.shanti.store.marketplace.entity.SellerContact;
import com.shanti.store.marketplace.entity.SellerDocument;
import com.shanti.store.marketplace.entity.SellerProfile;
import com.shanti.store.marketplace.enums.DocumentType;
import com.shanti.store.marketplace.response.SellerAddressResponse;
import com.shanti.store.marketplace.response.SellerBankDetailResponse;
import com.shanti.store.marketplace.response.SellerContactResponse;
import com.shanti.store.marketplace.response.SellerDocumentResponse;
import com.shanti.store.marketplace.response.SellerProfileResponse;
import com.shanti.store.marketplace.response.SellerResponse;

public class SellerMapper {

    private SellerMapper() {}
    
    public static SellerResponse toResponse(SellerAccount sellerAccount) {
        if (sellerAccount == null) return null;

        return SellerResponse.builder()
        		.id(sellerAccount.getId())
                .name(sellerAccount.getName())
                .status(sellerAccount.getStatus())
                .profile(toSellerProfileResponse(sellerAccount.getSellerProfile()))
                .build();
    }

    public static SellerProfileResponse toSellerProfileResponse(SellerProfile profile) {
        if (profile == null) return null;

        List<SellerContactResponse> contacts = profile.getContacts() == null ? List.of() :
                profile.getContacts().stream()
                        .map(SellerMapper::toResponse)
                        .collect(Collectors.toList());

        List<SellerAddressResponse> addresses = profile.getAddresses() == null ? List.of() :
                profile.getAddresses().stream()
                        .map(SellerMapper::toResponse)
                        .collect(Collectors.toList());

        List<SellerBankDetailResponse> bankDetails = profile.getBankDetails() == null ? List.of() :
                profile.getBankDetails().stream()
                        .map(SellerMapper::toResponse)
                        .collect(Collectors.toList());

        List<SellerDocumentResponse> documents = profile.getDocuments() == null ? List.of() :
                profile.getDocuments().stream()
                        .map(SellerMapper::toResponse)
                        .collect(Collectors.toList());

        return SellerProfileResponse.builder()
                .id(profile.getId())
                .businessName(profile.getBusinessName())
                .gstNumber(profile.getGstNumber())
                .registrationDate(profile.getRegistrationDate())
                .contacts(contacts)
                .addresses(addresses)
                .bankDetails(bankDetails)
                .documents(documents)
                .build();
    }

    private static SellerContactResponse toResponse(SellerContact contact) {
        return SellerContactResponse.builder()
                .phone(contact.getPhone())
                .email(contact.getEmail())
                .alternatePhone(contact.getAlternatePhone())
                .supportContact(contact.getSupportContact())
                .build();
    }

    private static SellerAddressResponse toResponse(SellerAddress address) {
        return SellerAddressResponse.builder()
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .zipCode(address.getZipCode())
                .isWarehouse(address.getIsWarehouse())
                .build();
    }

    private static SellerBankDetailResponse toResponse(SellerBankDetail bank) {
        return SellerBankDetailResponse.builder()
                .accountNumber(bank.getAccountNumber())
                .accountType(bank.getAccountType())
                .ifscCode(bank.getIfscCode())
                .bankName(bank.getBankName())
                .build();
    }

    private static SellerDocumentResponse toResponse(SellerDocument doc) {
        return SellerDocumentResponse.builder()
                .documentType(doc.getDocumentType().toString())
                .documentUrl(doc.getDocumentUrl())
                .remarks(doc.getRemarks())
                .build();
    }
}
