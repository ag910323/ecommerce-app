package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.enums.OrderStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
	    name = "orders",
	    indexes = {
	        @Index(name = "idx_order_user", columnList = "user_id"),
	        @Index(name = "idx_order_date", columnList = "order_date"),
	        @Index(name = "idx_order_user_date", columnList = "user_id, order_date")
	    }
	)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

//    @Enumerated(EnumType.STRING)
//    private PaymentStatus paymentStatus;

    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;

    @Column(nullable = false)
    private String deliveryAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shipment> shipments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal totalShipping;
    private BigDecimal totalDiscount;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    private String currency;
}