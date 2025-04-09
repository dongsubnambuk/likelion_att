package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.Service.Auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("https://likelion-13th-att.netlify.app")
@Tag(name = "인증 API", description = "회원가입, 로그인 등 인증 관련 API")
@RequiredArgsConstructor
public class Auth {
    private final AuthService authService;

    // 회갑
    @Operation(summary = "회원가입", description = "학번, 이름, 비밀번호, 역할을 받아서 저장")
    @PostMapping
    public ResponseEntity<?> signup(@RequestBody AuthDTO user) {
        return ResponseEntity.ok(StatusDTO
                .builder()
                .content(authService.signup(user).getName())
                .build());
    }

    // 로긴
    @Operation(summary = "로그인", description = "학번, 비밀번호로 로그인")
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestParam Long id, @RequestParam String password) {
        return ResponseEntity.ok(authService.signin(id, password));
    }
}