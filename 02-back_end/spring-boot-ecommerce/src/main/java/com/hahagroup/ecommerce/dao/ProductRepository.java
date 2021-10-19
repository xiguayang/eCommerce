package com.hahagroup.ecommerce.dao;

import com.hahagroup.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//entity type is Product, and primary key type is Long
//@RepositoryRestResource(collectionResourceRel = "product", path="products")
public interface ProductRepository extends JpaRepository<Product,Long> {
}
