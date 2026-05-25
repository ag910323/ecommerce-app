package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.shanti.store.marketplace.constants.OrderItemConstants;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = OrderItemConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@SuppressWarnings("serial")
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = OrderItemConstants.COL_PRODUCT, nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(name = OrderItemConstants.COL_QUANTITY, nullable = false)
    private Integer quantity;

    @Column(name = OrderItemConstants.COL_UNIT_PRICE, nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = OrderItemConstants.COL_TOTAL_PRICE, nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = OrderItemConstants.COL_DISCOUNT, precision = 10, scale = 2)
    private BigDecimal discount;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_price_snapshot", precision = 10, scale = 2)
    private BigDecimal productPriceSnapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @ToString.Exclude
    @JsonBackReference
    private Shipment shipment;
    
    @ManyToOne
    private ProductVariant variant;

    private String variantName;

    @ElementCollection
    private Map<String, String> attributes;
    
    private Boolean stockRestored = false;
}

