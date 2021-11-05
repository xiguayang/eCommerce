package com.hahagroup.ecommerce.config;

import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //protect endpoint: /api/orders
        //only accessible to authenticated users
        http.authorizeRequests()
                //apply to  this path and all sub-paths recursively
                .antMatchers("/api/orders/**")
                .authenticated()
                .and()
                //Configures OAuth2 Resource Server supports
                .oauth2ResourceServer()
                // Enables JWT-endcoded bearer token support
                .jwt();
        //add CORS filters
        http.cors();

        //force a non-empty response body for '401's to make the response more friendly
        Okta.configureResourceServer401ResponseBody(http);
    }
}
