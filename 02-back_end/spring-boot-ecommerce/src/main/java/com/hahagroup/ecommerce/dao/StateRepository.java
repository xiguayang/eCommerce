package com.hahagroup.ecommerce.dao;

import com.hahagroup.ecommerce.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;


@RepositoryRestResource
public interface StateRepository extends JpaRepository<State, Integer> {
    //to retrieve states for a given country code
    //http://localhost:8080//api/states/search/findByCountryCode?code=IN
    List<State> findByCountryCode(@Param("code") String code);
}
