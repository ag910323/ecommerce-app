package com.shanti.store.marketplace.entity;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "sponsorship_campaign")
@Data
@EqualsAndHashCode(callSuper = false)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SponsorshipCampaign extends BaseEntity {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Column(nullable = false)
	private String campaignName;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "seller_account_id", nullable = false)
	private SellerAccount sellerAccount;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal budget;
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal costPerClick;
	@Column(precision = 10, scale = 2)
	private BigDecimal dailyBudget;
	@Lob
	private String targetKeywords;
	@Column(nullable = false)
	private LocalDateTime startDate;
	@Column(nullable = false)
	private LocalDateTime endDate;
	@Enumerated(EnumType.STRING)
	@Builder.Default
	private CampaignStatus status = CampaignStatus.DRAFT;
	@Column(precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal totalSpent = BigDecimal.ZERO;
	@Builder.Default
	private Integer totalClicks = 0;
	@Builder.Default
	private Integer totalImpressions = 0;
	@Column(name = "priority")
	@Builder.Default
	private Integer priority = 0;


	public enum CampaignStatus {
		ACTIVE, PAUSED, COMPLETED, DRAFT
	}
}