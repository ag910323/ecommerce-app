package com.shanti.store.marketplace.response;

import com.shanti.store.marketplace.enums.SellerStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerResponse {

	private Long id;
    private String name;
    private SellerStatus status;
    private SellerProfileResponse profile;
}
