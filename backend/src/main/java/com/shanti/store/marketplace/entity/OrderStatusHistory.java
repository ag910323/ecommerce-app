package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.enums.OrderStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_status_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistory extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private OrderStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private OrderStatus newStatus;

    private String changedBy; // USER / SELLER / SYSTEM
}