package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.JWT.CustomUserDetailsService;
import com.likelion.attserver.JWT.JwtTokenUtil;
import com.likelion.attserver.Service.Auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("http://127.0.0.1:3000")
@Tag(name = "인증 API", description = "회원가입, 로그인 등 인증 관련 API")
@RequiredArgsConstructor
public class Auth {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthService authService;

    // 회갑
    @Operation(summary = "회원가입", description = "학번, 이름, 비밀번호, 역할을 받아서 저장")
    @PostMapping
    public ResponseEntity<?> signup(@RequestBody AuthDTO user) {
        try {
            return ResponseEntity.ok(StatusDTO
                    .builder()
                    .content(authService.signup(user).getName())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    // 로긴
    @Operation(summary = "로그인", description = "학번, 비밀번호로 로그인")
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestParam Long id, @RequestParam String password) {
        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(id, password));

            final UserDetails userDetails = customUserDetailsService.loadUserByUsername(id.toString());
            Map<String, Object> response = authService.getDetails(userDetails.getUsername()); // id가 username 으로 저장됨.
            final String token = jwtTokenUtil.generateToken(userDetails.getUsername(), response.get("role"));

            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }
}