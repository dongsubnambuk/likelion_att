package com.likelion.attserver.DAO.User;

import com.likelion.attserver.DAO.Team.TeamDAO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Exception.CustomException;
import com.likelion.attserver.JWT.CustomUserDetailsService;
import com.likelion.attserver.JWT.JwtTokenUtil;
import com.likelion.attserver.Repository.AttendanceRepository;
import com.likelion.attserver.Repository.TeamRepository;
import com.likelion.attserver.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
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
    private final TeamRepository teamRepository;
    private final AttendanceRepository attendanceRepository;

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

        if (teamRepository.existsByUsersContaining(user)) {
            TeamEntity teamEntity = teamRepository.getByUsersContaining(user);

            // 유저가 속한 출결 데이터를 명시적으로 삭제
            for (SchedulesEntity schedule : teamEntity.getSchedules()) {
                List<AttendanceEntity> toRemove = schedule.getAttendances().stream()
                        .filter(attendance -> attendance.getUser().equals(user))
                        .toList();

                toRemove.forEach(attendance -> {
                    schedule.getAttendances().remove(attendance); // 양방향 관계 정리
                    attendanceRepository.delete(attendance);
                });
            }

            // 팀에서 유저 제거
            teamEntity.getUsers().remove(user);
            teamRepository.save(teamEntity);
            log.info("deleted {} from team {}", id, teamEntity.getId());
        }

        userRepository.deleteById(id);
        log.info("deleted user {}", id);
    }

    @Override
    public UserDTO update(AuthDTO user) {
        UserEntity userEntity = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("잘못된 정보"));
        userEntity.setName(user.getName());
        userEntity.setPhone(user.getPhone());
        userEntity.setEmail(user.getEmail());
        userEntity.setTrack(user.getTrack());
        userEntity.setRole(user.getRole());
        if(user.getPassword() != null)
            userEntity.setPassword(passwordEncoder.encode(user.getPassword()));
        return UserEntity.toDTO(userRepository.save(userEntity));
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