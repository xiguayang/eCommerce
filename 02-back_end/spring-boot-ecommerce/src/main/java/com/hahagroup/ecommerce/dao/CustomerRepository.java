package com.hahagroup.ecommerce.dao;

import com.hahagroup.ecommerce.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

//not annotated RepositoryRestResource hence it will NOT be exposed as REST API based on our configurations
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByEmail(String theEmail);
}
