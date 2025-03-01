package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.User.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class User {
    private final UserService userService;

    // 전체 유저 조회
    @GetMapping("/all")
    public ResponseEntity<?> getUsers() {
        try{
            return ResponseEntity.ok(userService.getUsers());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(StatusDTO.builder()
                    .content(e.getMessage())
                    .build());
        }
    }

    // 역할별 조회
    @GetMapping
    public ResponseEntity<?> getRole(@RequestParam String role) {
        try{
            return ResponseEntity.ok(userService.getUserByRole(role));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(StatusDTO.builder()
                    .content(e.getMessage())
                    .build());
        }
    }
}
