package com.shanti.store.marketplace.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

	List<Product> findByCategoryId(Long categoryId);

	@Query("SELECT p FROM Product p WHERE p.isSponsored = true AND p.active = true "
			+ "AND p.sponsorStartDate <= :now AND p.sponsorEndDate >= :now "
			+ "ORDER BY p.sponsorPriority DESC, p.createdAt DESC")
	Page<Product> findActiveSponsoredProducts(@Param("now") LocalDateTime now, Pageable pageable);

	@Query("SELECT p FROM Product p WHERE p.active = true "
			+ "ORDER BY CASE WHEN (p.isSponsored = true AND p.sponsorStartDate <= :now AND p.sponsorEndDate >= :now) "
			+ "THEN p.sponsorPriority ELSE 0 END DESC, p.createdAt DESC")
	Page<Product> findProductsWithSponsoredFirst(@Param("now") LocalDateTime now, Pageable pageable);

	@Query("SELECT p FROM Product p WHERE p.active = true AND "
			+ "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR "
			+ "p.description LIKE LOWER(CONCAT('%', :searchTerm, '%'))) "
			+ "ORDER BY CASE WHEN (p.isSponsored = true AND p.sponsorStartDate <= :now AND p.sponsorEndDate >= :now) "
			+ "THEN p.sponsorPriority ELSE 0 END DESC, p.createdAt DESC")
	Page<Product> searchProductsWithSponsoredFirst(@Param("searchTerm") String searchTerm,
			@Param("now") LocalDateTime now, Pageable pageable);

	@Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isSponsored = true "
			+ "AND p.active = true AND p.sponsorStartDate <= :now AND p.sponsorEndDate >= :now "
			+ "ORDER BY p.sponsorPriority DESC")
	List<Product> findSponsoredProductsByCategory(@Param("categoryId") Long categoryId,
			@Param("now") LocalDateTime now);
	
	@Query("SELECT p FROM Product p WHERE p.active = true " +
		       "ORDER BY " +
		       "CASE p.brandPartnershipLevel " +
		       "WHEN 'EXCLUSIVE' THEN 4 " +
		       "WHEN 'TOP' THEN 3 " +
		       "WHEN 'FEATURED' THEN 2 " +
		       "WHEN 'PARTNER' THEN 1 " +
		       "ELSE 0 END DESC, " +
		       "p.partnershipPriority DESC, " +
		       "CASE WHEN p.isSponsored = true THEN p.sponsorPriority ELSE 0 END DESC, " +
		       "p.createdAt DESC")
		Page<Product> findProductsWithBrandPartnershipPriority(Pageable pageable);

	List<Product> findByBrandIdAndActiveTrue(Long brandId);

	List<Product> findByIsSponsoredTrueAndSponsorStartDateBeforeAndSponsorEndDateAfterOrderBySponsorPriorityDescNameAsc(
			LocalDateTime now1, LocalDateTime now2);

	@Query("SELECT p FROM Product p WHERE p.isSponsored = true AND p.sponsorStartDate <= :now AND p.sponsorEndDate >= :now ORDER BY p.sponsorPriority DESC, p.name ASC")
	List<Product> findActiveSponsoredProducts(@Param("now") LocalDateTime now);

	List<Product> findBySellerAccountIdAndIsSponsoredTrue(Long sellerId);
}
