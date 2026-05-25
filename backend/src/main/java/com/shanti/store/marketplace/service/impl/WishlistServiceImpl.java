package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Brand_;
import com.shanti.store.marketplace.entity.Category_;
import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.Product_;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.entity.Wishlist;
import com.shanti.store.marketplace.entity.WishlistItem;
import com.shanti.store.marketplace.entity.WishlistItem_;
import com.shanti.store.marketplace.entity.Wishlist_;
import com.shanti.store.marketplace.mapper.WishlistMapper;
import com.shanti.store.marketplace.repository.ProductRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.repository.WishlistItemRepository;
import com.shanti.store.marketplace.repository.WishlistRepository;
import com.shanti.store.marketplace.request.WishlistCreateRequest;
import com.shanti.store.marketplace.request.WishlistFilterRequest;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.WishlistResponse;
import com.shanti.store.marketplace.service.WishlistService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /** ✅ Create a new wishlist explicitly */
    @Override
    public WishlistResponse createWishlist(WishlistCreateRequest request) {
        User user = getUser(request.getUserId());

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return WishlistMapper.toResponse(wishlistRepository.save(wishlist));
    }

    /** ✅ Get all wishlists for a user */
    @Override
    public List<WishlistResponse> getUserWishlists(Long userId) {
        User user = getUser(userId);
        return wishlistRepository.findAllByUser(user)
                .stream().map(WishlistMapper::toResponse).toList();
    }

    /** ✅ Add product to wishlist (auto-create default if none exists) */
    @Override
    public WishlistResponse addToWishlist(Long userId, Long productId) {
        User user = getUser(userId);

        // Fetch user's default wishlist, or create it if none exists
        Wishlist wishlist = wishlistRepository.findByUserAndIsDefaultTrue(user)
                .orElseGet(() -> createDefaultWishlist(user));

        Product product = getProduct(productId);

        // Avoid duplicates
        boolean exists = wishlist.getItems().stream()
                .anyMatch(i -> i.getProduct().getId().equals(productId));

        if (!exists) {
            WishlistItem item = WishlistItem.builder()
                    .wishlist(wishlist)
                    .product(product)
                    .addedDate(java.time.LocalDateTime.now())
                    .build();

            wishlistItemRepository.save(item);
            wishlist.getItems().add(item);
        }

        return WishlistMapper.toResponse(wishlist);
    }

    /** ✅ Remove product from wishlist */
    @Override
    public WishlistResponse removeFromWishlist(Long wishlistId, Long productId) {
        Wishlist wishlist = getWishlist(wishlistId);
        wishlist.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        wishlistRepository.save(wishlist);
        return WishlistMapper.toResponse(wishlist);
    }

    /** ✅ Check if product is in wishlist */
    @Override
    public boolean isProductInWishlist(Long wishlistId, Long productId) {
        return wishlistItemRepository.existsByWishlistIdAndProductId(wishlistId, productId);
    }

    @PersistenceContext
    private EntityManager entityManager;
    
    /** ✅ Filter & paginate wishlist items */
    @Override
    public PagedResponse<WishlistResponse> filterWishlist(WishlistFilterRequest request) {

        if (request.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // 🔹 MAIN QUERY
        CriteriaQuery<Wishlist> query = cb.createQuery(Wishlist.class);
        Root<Wishlist> wishlistRoot = query.from(Wishlist.class);

        Join<Wishlist, WishlistItem> itemJoin = wishlistRoot.join(Wishlist_.items, JoinType.LEFT);
        Join<WishlistItem, Product> productJoin = itemJoin.join(WishlistItem_.product, JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();

        // ✅ user filter
        predicates.add(cb.equal(wishlistRoot.get(Wishlist_.user).get("id"), request.getUserId()));

        // ✅ wishlist filter
        if (request.getWishlistId() != null) {
            predicates.add(cb.equal(wishlistRoot.get(Wishlist_.id), request.getWishlistId()));
        }

        // 🔍 search
        if (request.getSearch() != null && !request.getSearch().isBlank()) {
            String like = "%" + request.getSearch().toLowerCase() + "%";
            predicates.add(cb.like(cb.lower(productJoin.get(Product_.name)), like));
        }

        // 💰 price filters
        if (request.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(
                    productJoin.get(Product_.price),
                    BigDecimal.valueOf(request.getMinPrice())
            ));
        }

        if (request.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(
                    productJoin.get(Product_.price),
                    BigDecimal.valueOf(request.getMaxPrice())
            ));
        }

        // 📦 category
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            predicates.add(productJoin.get(Product_.category)
                    .get(Category_.id)
                    .in(request.getCategoryIds()));
        }

        // 🏷 brand
        if (request.getBrandIds() != null && !request.getBrandIds().isEmpty()) {
            predicates.add(productJoin.get(Product_.brand)
                    .get(Brand_.id)
                    .in(request.getBrandIds()));
        }

        query.select(wishlistRoot)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .distinct(true);

        // 🔹 PAGINATION
        int page = request.getPagination().getPage();
        int size = request.getPagination().getSize();

        List<Wishlist> wishlists = entityManager.createQuery(query)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        // 🔹 COUNT QUERY (important)
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Wishlist> countRoot = countQuery.from(Wishlist.class);

        countQuery.select(cb.countDistinct(countRoot))
                .where(cb.equal(countRoot.get(Wishlist_.user).get("id"), request.getUserId()));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // 🔹 MAP + FILTER ITEMS
        List<WishlistResponse> content = wishlists.stream()
                .map(wishlist -> {

                    List<WishlistItem> filteredItems = wishlist.getItems().stream()
                            .filter(item -> item.getProduct() != null)

                            .filter(item -> {
                                if (request.getSearch() == null || request.getSearch().isBlank()) return true;
                                return item.getProduct().getName().toLowerCase()
                                        .contains(request.getSearch().toLowerCase());
                            })

                            .toList();

                    Wishlist temp = Wishlist.builder()
                            .id(wishlist.getId())
                            .name(wishlist.getName())
                            .description(wishlist.getDescription())
                            .items(filteredItems)
                            .build();

                    return WishlistMapper.toResponse(temp);
                })
                .toList();

        return new PagedResponse<>(content, page, size, total);
    }
    /** ✅ Helper: fetch user */
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    /** ✅ Helper: fetch wishlist by ID */
    private Wishlist getWishlist(Long wishlistId) {
        return wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));
    }

    /** ✅ Helper: fetch product */
    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    /** ✅ Helper: create default wishlist for a user */
    private Wishlist createDefaultWishlist(User user) {
    	Optional<Wishlist> existingDefault = wishlistRepository.findByUserAndIsDefaultTrue(user);
        if (existingDefault.isPresent()) {
            return existingDefault.get(); // Return existing default wishlist
        }
        Wishlist defaultWishlist = Wishlist.builder()
                .user(user)
                .name("My Wishlist")
                .description("Default wishlist")
                .isDefault(true) // mark as default
                .build();

        return wishlistRepository.save(defaultWishlist);
    }
    
    @Override
    public WishlistResponse addToWishlist(Long userId, Long wishlistId, Long productId) {
        User user = getUser(userId);

        Wishlist wishlist;

        if (wishlistId != null) {
            wishlist = getWishlist(wishlistId);
        } else {
            // Use default wishlist
            wishlist = wishlistRepository.findByUserAndIsDefaultTrue(user)
                    .orElseGet(() -> createDefaultWishlist(user));
        }

        Product product = getProduct(productId);

        boolean exists = wishlist.getItems().stream()
                .anyMatch(i -> i.getProduct().getId().equals(productId));

        if (!exists) {
            WishlistItem item = WishlistItem.builder()
                    .wishlist(wishlist)
                    .product(product)
                    .addedDate(java.time.LocalDateTime.now())
                    .build();

            wishlistItemRepository.save(item);
            wishlist.getItems().add(item);
        }

        return WishlistMapper.toResponse(wishlist);
    }

}
