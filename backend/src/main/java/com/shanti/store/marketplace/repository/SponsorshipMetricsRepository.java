package com.shanti.store.marketplace.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.SponsorshipMetrics;

public interface SponsorshipMetricsRepository extends JpaRepository<SponsorshipMetrics, Long> {

	Optional<SponsorshipMetrics> findByCampaignIdAndDate(Long campaignId, LocalDate today);

}
