package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.enums.VerificationStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "delivery_partner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"profile", "user"})
public class DeliveryPartner extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;

    @OneToOne(mappedBy = "deliveryPartner", cascade = CascadeType.ALL)
    private DeliveryPartnerProfile profile;
}