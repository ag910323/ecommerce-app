package com.shanti.store.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery_partner_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"deliveryPartner"})
public class DeliveryPartnerProfile extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@OneToOne
    @JoinColumn(name = "delivery_partner_id")
    private DeliveryPartner deliveryPartner;

    private String fullName;
    private String vehicleType; // e.g., Bike, Van, Truck
    private String vehicleNumber;

    @OneToMany(mappedBy = "deliveryPartnerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DeliveryPartnerDocument> documents = new ArrayList<>();
}