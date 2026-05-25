package com.shanti.store.marketplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.Brand;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    
    Optional<Brand> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Brand> findByActiveTrue();
    Page<Brand> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT b FROM Brand b WHERE b.active = true AND LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Brand> findByNameContainingIgnoreCaseAndActiveTrue(@Param("name") String name, Pageable pageable);
    
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Brand> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    @Query("SELECT b FROM Brand b WHERE b.active = true ORDER BY b.name ASC")
    Page<Brand> findPopularBrands(Pageable pageable);
    
    Optional<Brand> findByIdAndActiveTrue(Long id);

	@Query("SELECT b FROM Brand b WHERE b.partnershipLevel != 'NONE' AND b.active = true "
			+ "ORDER BY b.partnershipPriority DESC, b.name ASC")
	List<Brand> findActivePartnerBrands(Pageable pageable);

	@Query("SELECT b FROM Brand b WHERE b.partnershipLevel = :level AND b.active = true")
	List<Brand> findBrandsByPartnershipLevel(@Param("level") Brand.PartnershipLevel level);

	@Query("SELECT b FROM Brand b WHERE b.active = true " +
		       "AND (:name IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
		       "AND (:description IS NULL OR LOWER(b.description) LIKE LOWER(CONCAT('%', :description, '%'))) " +
		       "AND (:partnershipLevel IS NULL OR b.partnershipLevel = :partnershipLevel) " +
		       "AND (:hasLogo IS NULL OR (:hasLogo = true AND b.logo IS NOT NULL) OR (:hasLogo = false AND b.logo IS NULL)) " +
		       "AND (:isPartner IS NULL OR (:isPartner = true AND b.partnershipLevel != 'NONE') OR (:isPartner = false AND b.partnershipLevel = 'NONE')) " +
		       "AND (:partnershipBadge IS NULL OR LOWER(b.partnershipBadge) LIKE LOWER(CONCAT('%', :partnershipBadge, '%')))")
		Page<Brand> filterBrands(
		    @Param("name") String name,
		    @Param("description") String description, 
		    @Param("partnershipLevel") Brand.PartnershipLevel partnershipLevel,
		    @Param("hasLogo") Boolean hasLogo,
		    @Param("isPartner") Boolean isPartner,
		    @Param("partnershipBadge") String partnershipBadge,
		    Pageable pageable
		);
	
	List<Brand> findByActiveTrue(Sort sort);
}