package com.shanti.store.marketplace.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import com.shanti.store.marketplace.constants.OrderTrackingConstants;

@Entity
@Table(name = OrderTrackingConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class OrderTracking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = OrderTrackingConstants.COL_ORDER, nullable = false)
    @ToString.Exclude
    private Order order;

    @Column(name = OrderTrackingConstants.COL_STATUS, nullable = false)
    private String status; // e.g., "Dispatched", "In Transit", "Delivered"

    @Column(name = OrderTrackingConstants.COL_LOCATION)
    private String location;

    @Column(name = OrderTrackingConstants.COL_TIMESTAMP, nullable = false)
    private LocalDateTime timestamp;

    @Column(name = OrderTrackingConstants.COL_REMARKS)
    private String remarks;
}
