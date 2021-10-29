package com.hahagroup.ecommerce.dao;

import com.hahagroup.ecommerce.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin("http://localhost:4200")
@RepositoryRestResource
public interface StateRepository extends JpaRepository<State, Integer> {
    //to retrieve states for a given country code
    //http://localhost:8080//api/states/search/findByCountryCode?code=IN
    List<State> findByCountryCode(@Param("code") String code);
}
