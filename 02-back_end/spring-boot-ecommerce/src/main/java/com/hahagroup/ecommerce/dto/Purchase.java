package com.hahagroup.ecommerce.dto;

import com.hahagroup.ecommerce.entity.Address;
import com.hahagroup.ecommerce.entity.Customer;
import com.hahagroup.ecommerce.entity.Order;
import com.hahagroup.ecommerce.entity.OrderItem;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;


@Getter
@Setter
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
