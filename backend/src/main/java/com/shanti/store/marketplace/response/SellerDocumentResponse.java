package com.shanti.store.marketplace.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerDocumentResponse {

    private String documentType;
    private String documentUrl;
    private String remarks;
}
