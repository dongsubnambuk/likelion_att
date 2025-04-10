package com.likelion.attserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AttServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AttServerApplication.class, args);
    }

}
