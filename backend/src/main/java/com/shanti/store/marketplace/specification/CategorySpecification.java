package com.shanti.store.marketplace.specification;

import org.springframework.data.jpa.domain.Specification;
import com.shanti.store.marketplace.entity.Category;
import com.shanti.store.marketplace.entity.Category_;


public final class CategorySpecification {

    private CategorySpecification() {
        throw new UnsupportedOperationException("Utility class — cannot be instantiated");
    }

    public static Specification<Category> filterBy(String status, Long parentId, String name) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (status != null && !status.isBlank()) {
                predicates.getExpressions().add(cb.equal(root.get(Category_.status), status));
            }

            if (parentId != null) {
                predicates.getExpressions().add(cb.equal(root.get(Category_.parent).get(Category_.id), parentId));
            }

            if (name != null && !name.isBlank()) {
                predicates.getExpressions().add(
                    cb.like(cb.lower(root.get(Category_.name)), "%" + name.toLowerCase() + "%")
                );
            }

            return predicates;
        };
    }
}
