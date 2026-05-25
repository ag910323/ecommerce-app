package com.shanti.store.marketplace.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfileResponse {

    private Long id;
    private String businessName;
    private String gstNumber;
    private LocalDate registrationDate;

    private List<SellerContactResponse> contacts;
    private List<SellerAddressResponse> addresses;
    private List<SellerBankDetailResponse> bankDetails;
    private List<SellerDocumentResponse> documents;

}
