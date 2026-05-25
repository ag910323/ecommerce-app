package com.shanti.store.marketplace.request;

import java.time.LocalDate;
import java.util.List;

import com.shanti.store.marketplace.enums.RoleType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String firstName;
    private String lastName;
    private List<AddressRequest> userAddresses;

    private List<RoleType> roles;

    private String businessName;
    private String gstNumber;
    private LocalDate registrationDate;

    private List<SellerContactRequest> contacts;
    private List<SellerAddressRequest> addresses;
    private List<SellerBankDetailRequest> bankDetails;
    private List<SellerDocumentRequest> documents;

    private DeliveryPartnerRequest deliveryPartner;
}