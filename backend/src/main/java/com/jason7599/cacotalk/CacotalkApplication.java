package com.jason7599.cacotalk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CacotalkApplication {

	public static void main(String[] args) {
		SpringApplication.run(CacotalkApplication.class, args);
	}
}
