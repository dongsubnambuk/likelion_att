package com.likelion.attserver.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/att")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class Attendance {
}
