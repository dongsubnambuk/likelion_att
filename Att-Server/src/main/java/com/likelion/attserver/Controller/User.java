package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.User.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("https://likelion-13th-att.netlify.app")
@Tag(name = "유저 API", description = "유저 정보, 권한 조회 관련 API")
@RequiredArgsConstructor
public class User {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    // 전체 유저 조회
    @Operation(summary = "모든 유저 조회", description = "모든 유저 조회")
    @GetMapping("/all")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    // 역할별 조회
    @Operation(summary = "권한 조회", description = "해당 권한을 가지는 유저 리스트 조회")
    @GetMapping
    public ResponseEntity<?> getRole(@RequestParam String role) {
        return ResponseEntity.ok(userService.getUserByRole(role));
    }

    @Operation(summary = "회원 탍퇴", description = "해당 인원의 모든 정보 삭제")
    @DeleteMapping
    public  ResponseEntity<?> deleteUser(@RequestParam Long id,  @RequestParam String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(id, password));
        return ResponseEntity.ok(userService.deleteUser(id, password));
    }
}
