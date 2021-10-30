package com.hahagroup.ecommerce.service;

import com.hahagroup.ecommerce.dto.Purchase;
import com.hahagroup.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
