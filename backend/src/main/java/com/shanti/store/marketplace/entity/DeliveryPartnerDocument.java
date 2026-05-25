package com.shanti.store.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "delivery_partner_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"deliveryPartnerProfile"})
public class DeliveryPartnerDocument extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne
    @JoinColumn(name = "profile_id")
    private DeliveryPartnerProfile deliveryPartnerProfile;

    private String documentType;
    private String documentUrl;
}