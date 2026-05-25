package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "sponsorship_metrics")
@Data
@EqualsAndHashCode(callSuper = false)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SponsorshipMetrics extends BaseEntity {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "campaign_id", nullable = false)
	private SponsorshipCampaign campaign;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;
	@Column(nullable = false)
	private LocalDate date;
	@Builder.Default
	private Integer impressions = 0;
	@Builder.Default
	private Integer clicks = 0;
	@Column(precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal cost = BigDecimal.ZERO;
	@Builder.Default
	private Integer conversions = 0;
	@Column(precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal revenue = BigDecimal.ZERO;
}
