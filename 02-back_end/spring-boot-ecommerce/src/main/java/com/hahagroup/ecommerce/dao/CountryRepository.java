package com.hahagroup.ecommerce.dao;

import com.hahagroup.ecommerce.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//@CrossOrigin("http://localhost:4200")
@RepositoryRestResource(collectionResourceRel = "countries", path="countries")
//expose/countries endpoint
public interface CountryRepository extends JpaRepository<Country, Integer> {
}
