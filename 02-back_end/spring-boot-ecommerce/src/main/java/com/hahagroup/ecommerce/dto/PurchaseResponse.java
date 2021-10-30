package com.hahagroup.ecommerce.dto;

import lombok.Data;

@Data
public class PurchaseResponse {
    // using this class to send back a java object as JSON

    private final String orderTrackingNumber;
}
