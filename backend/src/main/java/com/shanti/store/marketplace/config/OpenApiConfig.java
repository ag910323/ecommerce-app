package com.shanti.store.marketplace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI marketplaceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Marketplace API")
                        .description("Multi Vendor Ecommerce Marketplace APIs")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Ajay Gupta")
                                .email("your-email@example.com"))
                        .license(new License()
                                .name("MIT License")));
    }
}
