package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.Cart;
import com.shanti.store.marketplace.entity.CartItem;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.ProductStatus;
import com.shanti.store.marketplace.enums.SellerStatus;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.repository.AddressRepository;
import com.shanti.store.marketplace.repository.ProductVariantRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.request.AddressRequest;
import com.shanti.store.marketplace.request.BuyNowRequest;
import com.shanti.store.marketplace.request.CheckoutRequest;
import com.shanti.store.marketplace.service.InventoryService;
import com.shanti.store.marketplace.service.OrderBuilderService;
import com.shanti.store.marketplace.service.ShipmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderBuilderServiceImpl implements OrderBuilderService {

	private final UserRepository userRepository;
	private final ProductVariantRepository variantRepository;
	private final InventoryService inventoryService;
	private final AddressRepository addressRepository;
	private final ShipmentService shipmentService;

	@Override
	public Order createBaseOrder(User user, String address, Address addressEntity) {
		return Order.builder().user(user).orderDate(LocalDateTime.now()).status(OrderStatus.CREATED)
				.deliveryAddress(address).address(addressEntity).subtotal(BigDecimal.ZERO)
				.totalShipping(BigDecimal.ZERO).totalDiscount(BigDecimal.ZERO).totalPrice(BigDecimal.ZERO).build();
	}

	@Override
	public Order buildBuyNowOrder(BuyNowRequest request, boolean reduceStock) {
		if (request.getVariantId() == null) {
			throw new RuntimeException("variantId is required for Buy Now");
		}

		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new EntityNotFoundException("User not found"));

		ProductVariant variant = variantRepository.findById(request.getVariantId())
				.orElseThrow(() -> new EntityNotFoundException("Variant not found"));

		Product product = variant.getProduct();

		// ── Validate product availability and seller status before any stock work ──
		validateProductAndSeller(product);

		int quantity = request.getQuantity() != null && request.getQuantity() > 0
				? request.getQuantity()
				: 1;

		Address addressEntity = resolveAddressEntity(request.getAddressId());

		String address = resolveAddressString(addressEntity,
				request.getAddress() != null ? buildAddressSnapshotFromRequest(request.getAddress()) : null
		);

		if (reduceStock) {
			inventoryService.validateAndReduceStock(variant, quantity);
		}

		Order order = createBaseOrder(user, address, addressEntity);

		OrderItem item = buildOrderItem(variant, quantity, variant.getPrice() != null ? variant.getPrice() : product.getPrice());

		shipmentService.createShipment(order, product.getSellerAccount(), new ArrayList<>(List.of(item)), addressEntity);

		applyOrderTotals(order);

		return order;
	}

	@Override
	public Order buildCheckoutOrder(CheckoutRequest request, boolean reduceStock) {

		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new EntityNotFoundException("User not found"));

		Cart cart = user.getCart();
		if (cart == null || cart.getCartItems().isEmpty()) {
			throw new RuntimeException("Cart is empty");
		}

		Address addressEntity = resolveAddressEntity(request.getAddressId());
		String address = resolveAddressString(addressEntity, request.getDeliveryAddress());

		Order order = createBaseOrder(user, address, addressEntity);

		// ── Validate all cart items before touching inventory or building shipments ──
		for (CartItem ci : cart.getCartItems()) {
			Product product = ci.getVariant().getProduct();
			validateProductAndSeller(product);
		}

		Map<Long, List<CartItem>> grouped =
			cart.getCartItems().stream()
				.collect(Collectors.groupingBy(
					ci -> ci.getVariant().getProduct().getSellerAccount().getId()
				));

		for (Map.Entry<Long, List<CartItem>> entry : grouped.entrySet()) {

			SellerAccount seller = entry.getValue()
					.get(0)
					.getVariant()
					.getProduct()
					.getSellerAccount();

			List<CartItem> cartItems = entry.getValue();

			if (reduceStock) {
				inventoryService.validateAndReduceStock(cartItems);
			}

			List<OrderItem> items = cartItems.stream()
					.map(ci -> buildOrderItem(ci.getVariant(), ci.getQuantity(), ci.getPrice()))
					.collect(Collectors.toList());

			shipmentService.createShipment(order, seller, items, addressEntity);
		}

		applyOrderTotals(order);

		return order;
	}

	// ── Centralized validation — called before stock reduction in every order flow ──

	/**
	 * Validates that a product is ACTIVE and its seller is VERIFIED.
	 * Covers: real checkout, buy-now, preview checkout, preview buy-now.
	 * Must be called after variant.getProduct() is resolved and before any
	 * inventory operation.
	 */
	private void validateProductAndSeller(Product product) {

		// Guard: variant → product link (DB constraint enforces this, but be explicit)
		if (product == null) {
			throw new RuntimeException("Product data is unavailable. Please refresh and try again.");
		}

		// Guard: product status — null treated as non-ACTIVE
		if (product.getStatus() != ProductStatus.ACTIVE) {
			throw new RuntimeException(
					"Product '" + product.getName() + "' is currently unavailable."
			);
		}

		// Guard: seller must exist on the product
		SellerAccount seller = product.getSellerAccount();
		if (seller == null) {
			throw new RuntimeException(
					"Product '" + product.getName() + "' is currently unavailable."
			);
		}

		// Guard: seller status — null treated as non-VERIFIED
		if (seller.getStatus() != SellerStatus.VERIFIED) {
			throw new RuntimeException(
					"Seller for '" + product.getName() + "' is currently unavailable."
			);
		}
	}

	// ── Existing private helpers — unchanged ────────────────────────────────

	private void applyOrderTotals(Order order) {

		BigDecimal subtotal = BigDecimal.ZERO;
		BigDecimal shipping = BigDecimal.ZERO;
		BigDecimal discount = BigDecimal.ZERO;

		for (Shipment shipment : order.getShipments()) {
			subtotal = subtotal.add(shipment.getItemsTotal());
			shipping = shipping.add(shipment.getShippingCharge());
			discount = discount.add(shipment.getDiscount());
		}

		order.setSubtotal(subtotal);
		order.setTotalShipping(shipping);
		order.setTotalDiscount(discount);
		order.setTotalPrice(subtotal.add(shipping).subtract(discount));
	}

	private OrderItem buildOrderItem(ProductVariant variant, int quantity, BigDecimal price) {

		Map<String, String> safeAttributes =
				variant.getAttributes() != null
						? new java.util.HashMap<>(variant.getAttributes())
						: new java.util.HashMap<>();

		return OrderItem.builder()
				.product(variant.getProduct())
				.variant(variant)
				.variantName(variant.getVariantName())
				.attributes(safeAttributes)
				.productName(variant.getProduct().getName())
				.quantity(quantity)
				.unitPrice(price)
				.totalPrice(price.multiply(BigDecimal.valueOf(quantity)))
				.discount(BigDecimal.ZERO)
				.build();
	}

	private Address resolveAddressEntity(Long addressId) {
		if (addressId == null) return null;

		return addressRepository.findById(addressId)
				.orElseThrow(() -> new RuntimeException("Address not found"));
	}

	private String resolveAddressString(Address address, String fallback) {
		if (address != null) return buildAddressSnapshot(address);
		if (fallback != null) return fallback;

		throw new RuntimeException("Delivery address is required");
	}

	private String buildAddressSnapshot(Address address) {
		return Arrays.asList(
				address.getFullName(),
				address.getPhoneNumber(),
				address.getStreet(),
				address.getLandmark(),
				address.getCity(),
				address.getState(),
				address.getCountry(),
				address.getZipCode()
		).stream()
		 .filter(Objects::nonNull)
		 .filter(s -> !s.trim().isEmpty())
		 .collect(Collectors.joining(", "));
	}

	private String buildAddressSnapshotFromRequest(AddressRequest addr) {
		return Arrays.asList(
				addr.getFullName(),
				addr.getPhoneNumber(),
				addr.getStreet(),
				addr.getLandmark(),
				addr.getCity(),
				addr.getState(),
				addr.getCountry(),
				addr.getZipCode()
		).stream()
		 .filter(Objects::nonNull)
		 .filter(s -> !s.trim().isEmpty())
		 .collect(Collectors.joining(", "));
	}
}