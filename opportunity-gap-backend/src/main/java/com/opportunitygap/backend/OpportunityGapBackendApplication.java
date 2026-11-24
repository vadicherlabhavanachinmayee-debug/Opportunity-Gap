
package com.opportunitygap.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OpportunityGapBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpportunityGapBackendApplication.class, args);
    }
}
