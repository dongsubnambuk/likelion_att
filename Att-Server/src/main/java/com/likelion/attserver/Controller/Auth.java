package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.JWT.CustomUserDetailsService;
import com.likelion.attserver.JWT.JwtTokenUtil;
import com.likelion.attserver.Service.Auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class Auth {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthService authService;

    // 회갑
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