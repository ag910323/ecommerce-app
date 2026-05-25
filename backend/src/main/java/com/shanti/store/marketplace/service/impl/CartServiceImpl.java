package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Cart;
import com.shanti.store.marketplace.entity.CartItem;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.mapper.CartMapper;
import com.shanti.store.marketplace.repository.CartRepository;
import com.shanti.store.marketplace.repository.ProductVariantRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.request.AddToCartRequest;
import com.shanti.store.marketplace.request.RemoveFromCartRequest;
import com.shanti.store.marketplace.response.CartResponse;
import com.shanti.store.marketplace.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    public CartResponse addToCart(AddToCartRequest request) {
        User user = findUser(request.getUserId());

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        Cart cart = user.getCart();
        if (cart == null) {
            cart = Cart.builder().user(user).build();
            user.setCart(cart);
        }

        CartItem existingItem = cart.getCartItems().stream()
                .filter(ci -> ci.getVariant().getId().equals(variant.getId()))
                .findFirst()
                .orElse(null);

        int requestedQty = request.getQuantity();
        int finalQty = (existingItem != null)
                ? existingItem.getQuantity() + requestedQty
                : requestedQty;

        // ✅ CORRECT stock validation
        if (variant.getStockQuantity() < finalQty) {
            throw new RuntimeException("Not enough stock available");
        }

        if (existingItem != null) {
            existingItem.setQuantity(finalQty);
        } else {
            BigDecimal price = variant.getPrice() != null
                    ? variant.getPrice()
                    : variant.getProduct().getPrice();

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(requestedQty)
                    .price(price)
                    .build();

            cart.getCartItems().add(newItem);
        }

        updateCartTotals(cart);
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse getCart(Long userId) {
        User user = findUser(userId);

        Cart cart = user.getCart();
        if (cart == null) {
            cart = Cart.builder()
                    .user(user)
                    .totalItems(0)
                    .totalSellingPrice(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .totalMRP(BigDecimal.ZERO)
                    .build();
        }

        return CartMapper.toResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(AddToCartRequest request) {
        User user = findUser(request.getUserId());
        Cart cart = ensureCartExists(user);

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getVariant().getId().equals(variant.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        int requestedQty = request.getQuantity();

        if (requestedQty < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        // ✅ stock validation
        if (variant.getStockQuantity() == null || variant.getStockQuantity() < requestedQty) {
            throw new RuntimeException("Not enough stock available");
        }

        item.setQuantity(requestedQty);

        updateCartTotals(cart);
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse removeFromCart(RemoveFromCartRequest request) {
        User user = findUser(request.getUserId());
        Cart cart = ensureCartExists(user);

        cart.getCartItems().removeIf(
                ci -> ci.getVariant().getId().equals(request.getVariantId())
        );

        updateCartTotals(cart);
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Cart ensureCartExists(User user) {
        Cart cart = user.getCart();
        if (cart == null) {
            throw new RuntimeException("Cart is empty");
        }
        return cart;
    }

    private void updateCartTotals(Cart cart) {
        int totalItems = 0;
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem item : cart.getCartItems()) {
            totalItems += item.getQuantity();
            totalPrice = totalPrice.add(
                    item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
            );
        }

        cart.setTotalItems(totalItems);
        cart.setTotalSellingPrice(totalPrice);
        cart.setTotalMRP(totalPrice);
        cart.setTotalDiscount(BigDecimal.ZERO);
    }

	@Override
	public void clearCart(User user) {
        Cart cart = user.getCart();
        if (cart != null) {
            cart.getCartItems().clear();
            cart.setTotalItems(0);
            cart.setTotalSellingPrice(BigDecimal.ZERO);
            cartRepository.save(cart);
        }
    }
}