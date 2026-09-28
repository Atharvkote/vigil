package com.vigilsense.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI vigilSenseOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("VigilSense API")
                        .description("Weather-Based Sensor Calibration Suggestion System")
                        .version("v1"));
    }
}
