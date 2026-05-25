package com.shanti.store.marketplace.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

	List<Category> findByParentId(Long parentId);
    List<Category> findByParentIsNull();
    @Query("SELECT c FROM Category c\r\n"
    		+ "    WHERE (:status IS NULL OR c.status = :status)\r\n"
    		+ "      AND (:parentId IS NULL OR c.parent.id = :parentId)\r\n"
    		+ "      AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))\r\n"
    		+ "    ORDER BY c.name ASC")
    	List<Category> filterCategories(
    	    @Param("status") String status,
    	    @Param("parentId") Long parentId,
    	    @Param("name") String name
    	);

	
}

