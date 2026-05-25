package com.shanti.store.marketplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.shanti.store.marketplace.entity.Order;

import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);
    @Query("""
    	    SELECT DISTINCT o FROM Order o
    	    JOIN o.shipments s
    	    WHERE s.sellerAccount.id = :sellerId
    	""")
    	List<Order> findOrdersBySellerId(Long sellerId);
    
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    @Query(
    	    value = """
    	        SELECT DISTINCT o FROM Order o
    	        JOIN o.shipments s
    	        WHERE s.sellerAccount.id = :sellerId
    	    """,
    	    countQuery = """
    	        SELECT COUNT(DISTINCT o.id) FROM Order o
    	        JOIN o.shipments s
    	        WHERE s.sellerAccount.id = :sellerId
    	    """
    	)
    Page<Order> findOrdersBySellerId(Long sellerId, Pageable pageable);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(Long id);
    
}