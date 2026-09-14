package com.jason7599.cacotalk;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CacotalkApplication {

	public static void main(String[] args) {
		SpringApplication.run(CacotalkApplication.class, args);
	}

	@Bean
	CommandLineRunner test(

	) {
		return args -> {
			System.out.println("CacotalkApplication.test");
		};
	}
}
