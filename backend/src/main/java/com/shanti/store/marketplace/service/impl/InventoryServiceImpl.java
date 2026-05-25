package com.shanti.store.marketplace.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.CartItem;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.repository.ProductVariantRepository;
import com.shanti.store.marketplace.service.InventoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductVariantRepository variantRepository;

    @Override
    public void validateAndReduceStock(ProductVariant variant, int quantity) {

        ProductVariant lockedVariant = variantRepository
                .findByIdForUpdate(variant.getId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (lockedVariant.getStockQuantity() < quantity) {
            throw new RuntimeException(
                    "Not enough stock for variant: " + lockedVariant.getVariantName()
            );
        }

        lockedVariant.setStockQuantity(
                lockedVariant.getStockQuantity() - quantity
        );

        variantRepository.save(lockedVariant);
    }

    @Override
    public void validateAndReduceStock(List<CartItem> cartItems) {

        List<ProductVariant> variantsToUpdate = new ArrayList<>();

        for (CartItem ci : cartItems) {

            ProductVariant variant = variantRepository
                    .findByIdForUpdate(ci.getVariant().getId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            if (variant.getStockQuantity() < ci.getQuantity()) {
                throw new RuntimeException(
                        "Not enough stock for variant: " + variant.getVariantName()
                );
            }

            variant.setStockQuantity(
                    variant.getStockQuantity() - ci.getQuantity()
            );

            variantsToUpdate.add(variant);
        }

        // ✅ IMPORTANT: batch save
        variantRepository.saveAll(variantsToUpdate);
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void restoreStock(Order order) {

        List<ProductVariant> variantsToUpdate = new ArrayList<>();

        for (Shipment shipment : order.getShipments()) {
            for (OrderItem item : shipment.getItems()) {

                if (Boolean.TRUE.equals(item.getStockRestored())) {
                    continue;
                }

                ProductVariant variant = variantRepository
                        .findByIdForUpdate(item.getVariant().getId())
                        .orElseThrow(() -> new RuntimeException("Variant not found"));

                variant.setStockQuantity(
                        variant.getStockQuantity() + item.getQuantity()
                );

                item.setStockRestored(true);

                variantsToUpdate.add(variant);
            }
        }

        variantRepository.saveAll(variantsToUpdate);
    }
    
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void restoreStockForShipment(Shipment shipment) {

        List<ProductVariant> variantsToUpdate = new ArrayList<>();

        shipment.getItems().forEach(item -> {

            if (Boolean.TRUE.equals(item.getStockRestored())) return;

            ProductVariant variant = variantRepository
                    .findByIdForUpdate(item.getVariant().getId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            variant.setStockQuantity(
                    variant.getStockQuantity() + item.getQuantity()
            );

            item.setStockRestored(true);
            variantsToUpdate.add(variant);
        });

        if (!variantsToUpdate.isEmpty()) {
            variantRepository.saveAll(variantsToUpdate);
        }
    }
    
}