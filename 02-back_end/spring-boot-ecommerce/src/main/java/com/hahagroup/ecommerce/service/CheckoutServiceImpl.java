package com.hahagroup.ecommerce.service;

import com.hahagroup.ecommerce.dao.CustomerRepository;
import com.hahagroup.ecommerce.dto.Purchase;
import com.hahagroup.ecommerce.dto.PurchaseResponse;
import com.hahagroup.ecommerce.entity.Customer;
import com.hahagroup.ecommerce.entity.Order;
import com.hahagroup.ecommerce.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService{
    private CustomerRepository customerRepository;
    @Autowired
    //autowired is optional since we only have one constructor
    public CheckoutServiceImpl(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //retrieve teh order info from dto
        Order order = purchase.getOrder();
        //generate tracking number
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);
        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));
        //populate order with billingAddress and billingAddress
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        //populate customer with order
        Customer customer = purchase.getCustomer();
        //check if this is an existing customer by the given email..
        String theEmail = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(theEmail);
        if(customerFromDB !=null){
            //the customer with theEmail has existed in DB
            customer = customerFromDB;
        }
        customer.add(order);
        //save to the database
        customerRepository.save(customer);
        //return a response;
        return new PurchaseResponse(orderTrackingNumber);
    }
    //unique random id
    private String generateOrderTrackingNumber() {
        //generate a random UUID number(UUID version-4, have 4 versions)
        //UUID: universally unique identifier
        //Standardized methods for generating unique IDs
        return UUID.randomUUID().toString();
    }

}
