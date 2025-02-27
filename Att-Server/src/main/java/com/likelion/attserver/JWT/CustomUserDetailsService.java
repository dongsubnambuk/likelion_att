package com.likelion.attserver.JWT;

import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public abstract class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetails loadUserByUsername(Long id) throws UsernameNotFoundException {
        // 먼저 사용자 찾기
        UserEntity user = userRepository.findById(id).orElse(null);

        return new org.springframework.security.core.userdetails.User(
                    Objects.requireNonNull(user).getId().toString(),
                    user.getPassword(),
                    new ArrayList<>()
        );
    }
}
