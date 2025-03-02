package com.likelion.attserver.Config;

import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.JWT.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component  // ✅ Spring 빈으로 등록
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // JWT 검증을 생략할 경로 설정
        if (path.equals("/api/auth") ||
                path.equals("/api/auth/signin") ||
                path.equals("/api/team/all") ||
                path.equals("/api/user") ||
                path.equals("/api/user/all")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 헤더 가져오기
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json"); // JSON 형식으로 설정
            String errorMessage = "{ \"message\": \"JWT Token is missing\" }";
            response.getWriter().write(errorMessage); // JSON 형식으로 메시지 전송
            return;
        }

        // 토큰 검증 및 역할(Role) 정보 추출
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            String errorMessage = "{ \"message\": \"Invalid JWT Token\" }";
            response.getWriter().write(errorMessage);
            return;
        }

        if((path.equals("/api/schedules") && method.equals("POST")) ||
                (path.equals("/api/team") && method.equals("POST")) ||
                (path.equals("/api/schedules") && method.equals("DELETE")) ||
                (path.equals("/api/att") && method.equals("PUT")) ||
                (path.equals("/api/team") && method.equals("DELETE"))) {
            // JWT에서 ROLE 정보 가져오기
            UserEntity.Role role = jwtUtil.getRoleFromToken(token);
            if (role != UserEntity.Role.ADMIN) { // ADMIN이 아니면 차단
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType("application/json");
                String errorMessage = "{ \"message\": \"Access Denied: Admin role required\" }";
                response.getWriter().write(errorMessage);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
