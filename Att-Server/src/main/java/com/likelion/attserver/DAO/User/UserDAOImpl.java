package com.likelion.attserver.DAO.User;

import com.likelion.attserver.DAO.Team.TeamDAO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Exception.CustomException;
import com.likelion.attserver.JWT.CustomUserDetailsService;
import com.likelion.attserver.JWT.JwtTokenUtil;
import com.likelion.attserver.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Transactional
public class UserDAOImpl implements UserDAO {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamDAO teamDAO;

    @Override
    public UserDTO addUser(AuthDTO user) {
        if(userRepository.existsById(user.getId()))
            throw new CustomException("이미 존재하는 학생", HttpStatus.BAD_REQUEST);
        UserEntity userEntity = UserEntity.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .password(passwordEncoder.encode(user.getPassword()))
                .track(user.getTrack())
                .role(user.getRole())
                .build();
        return UserEntity.toDTO(userRepository.save(userEntity));
    }

    @Override
    public Map<String, Object> signin(Long id, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(id, password));

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("잘못된 ID", HttpStatus.BAD_REQUEST));

        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("name", user.getName());
        response.put("phone", user.getPhone());
        response.put("email", user.getEmail());
        response.put("Track", user.getTrack());
        response.put("role", user.getRole());

        final UserDetails userDetails = customUserDetailsService.loadUserByUsername(id.toString());
        final String token = jwtTokenUtil.generateToken(userDetails.getUsername(), response.get("role"));

        response.put("token", token);
        return response;
    }

    @Override
    public List<UserDTO> getUserByRole(String role) {
        return userRepository.findByRole(UserEntity.Role.valueOf(role));
    }

    @Override
    public Map<String, Object> userMap() throws IllegalStateException{
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("admin", userRepository.findByRole(UserEntity.Role.ADMIN));
        userMap.put("users", userRepository.findByRole(UserEntity.Role.STUDENT));
        return userMap;
    }

    @Override
    public void deleteUser(Long id, String password) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 유저 ID"));
        teamDAO.deleteUserTeam(user);
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO update(AuthDTO user) {
        if(userRepository.existsById(user.getId())) {
            UserEntity userEntity = UserEntity.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .email(user.getEmail())
                    .password(passwordEncoder.encode(user.getPassword()))
                    .track(user.getTrack())
                    .role(user.getRole())
                    .build();
            return UserEntity.toDTO(userRepository.save(userEntity));
        } else {
            throw new IllegalArgumentException("수정 실패");
        }
    }

    @Override
    public void changePassword(Long id, String password) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 아이디"));
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @Override
    public boolean existsId(Long id) {
        return userRepository.existsById(id);
    }

    @Override
    public String getEmailById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 학번"))
                .getEmail();
    }
}