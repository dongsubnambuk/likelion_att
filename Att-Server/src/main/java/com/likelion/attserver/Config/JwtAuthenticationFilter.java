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
import java.util.Set;

@Component  // ✅ Spring 빈으로 등록
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String key = method + ":" + path;
        String route = path;

        Set<String> jwtPassRoute = Set.of(
                "/api/auth",
                "/api/auth/signin",
                "/api/swagger-ui",
                "/api/v3/api-docs",
                "/swagger-resources",
                "/webjars",
                "/api/mail/mail-send",
                "/api/mail/mail-check"
        );

        // JWT 검증을 생략할 경로 설정
        if (jwtPassRoute.contains(route)) {
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

        Set<String> adminOnlyRoutes = Set.of(
                "POST:/api/schedules",
                "POST:/api/team",
                "DELETE:/api/schedules",
                "PUT:/api/att",
                "DELETE:/api/team",
                "POST:/api/docs",
                "DELETE:/api/docs",
                "DELETE:/api/docs/team",
                "PUT:/api/docs"
        );

        if(adminOnlyRoutes.contains(key)) {
            // JWT에서 ROLE 정보 가져오기
            UserEntity.Role role = jwtUtil.getRoleFromToken(token);
            if (role != UserEntity.Role.ADMIN) { // ADMIN이 아니면 차단
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                String errorMessage = "{ \"message\": \"Access Denied: Admin role required\" }";
                response.getWriter().write(errorMessage);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
