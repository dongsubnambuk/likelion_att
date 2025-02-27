package com.likelion.attserver.DAO;

import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Transactional
public class UserDAOImpl implements UserDAO {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDTO addUser(UserDTO user) {
        if(userRepository.existsById(user.getId()))
            throw new IllegalArgumentException("이미 존재하는 학생");
        UserEntity userEntity = UserEntity.builder()
                .id(user.getId())
                .name(user.getName())
                .password(passwordEncoder.encode(user.getPassword()))
                .role(user.getRole())
                .build();
        return UserEntity.toDTO(userRepository.save(userEntity));
    }

    @Override
    public Map<String, Object> findDetails(String id) {
        UserEntity user = userRepository.findById(Long.parseLong(id))
                .orElseThrow(() -> new IllegalArgumentException("잘못된 ID"));

        Map<String, Object> details = new HashMap<>();
        details.put("id", id);
        details.put("name", user.getName());
        details.put("role", user.getRole());
        return details;
    }
}
