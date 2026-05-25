package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.request.BuyNowRequest;
import com.shanti.store.marketplace.request.CheckoutRequest;

public interface OrderBuilderService {

	Order createBaseOrder(User user, String address, Address addressEntity);
	
	Order buildBuyNowOrder(BuyNowRequest request, boolean reduceStock);
	
	Order buildCheckoutOrder(CheckoutRequest request, boolean reduceStock);
}