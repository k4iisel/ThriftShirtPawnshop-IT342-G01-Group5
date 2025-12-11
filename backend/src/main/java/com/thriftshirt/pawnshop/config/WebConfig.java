package com.thriftshirt.pawnshop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
        private String allowedOrigins;

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOriginPatterns(allowedOrigins.split(","))
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .allowCredentials(true);
        }

        @Override
        public void addResourceHandlers(
                        org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations("file:uploads/");
        }
}
