package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.enums.ShipmentStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipment_status_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentStatusHistory extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shipmentId;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus newStatus;

    private String changedBy; // USER / SELLER / SYSTEM
}