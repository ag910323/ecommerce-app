package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.enums.ShipmentStatus;

import jakarta.persistence.CascadeType;
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
	    name = "shipments",
	    indexes = {
	        @Index(name = "idx_shipment_seller", columnList = "seller_account_id"),
	        @Index(name = "idx_shipment_order", columnList = "order_id")
	    }
	)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_account_id", nullable = false)
    private SellerAccount sellerAccount;

    @Builder.Default
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // ✅ KEY CHANGE: TRANSACTIONS MOVED HERE
    @Builder.Default
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL)
    private List<Transaction> transactions = new ArrayList<>();

    // ✅ TRACKING MOVED HERE
    @Builder.Default
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentTracking> trackingEvents = new ArrayList<>();

    private BigDecimal itemsTotal;
    private BigDecimal shippingCharge;
    private BigDecimal discount;
    private BigDecimal finalAmount;

    private String courierPartner;
    private String trackingId;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private LocalDateTime estimatedDelivery;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    private String sellerName;
    private String sellerPincode;
}