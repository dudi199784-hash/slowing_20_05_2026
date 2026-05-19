package com.slowind.chunchunhee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
public class ChunchunheeApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChunchunheeApplication.class, args);
	}

}
