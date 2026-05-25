package com.shanti.store.marketplace.entity;

import java.time.LocalDateTime;

import com.shanti.store.marketplace.enums.ShipmentStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipment_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentTracking extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private String location;

    private LocalDateTime timestamp;

    private String remarks;
}
