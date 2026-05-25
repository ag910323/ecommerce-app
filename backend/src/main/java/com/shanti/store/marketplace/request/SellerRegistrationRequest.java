package com.shanti.store.marketplace.request;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRegistrationRequest {
	
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;

    private String businessName;
    private String gstNumber;

    private LocalDate registrationDate;

    private List<SellerContactRequest> contacts;
    private List<SellerAddressRequest> addresses;
    private List<SellerBankDetailRequest> bankDetails;
    private List<SellerDocumentRequest> documents;
}

