package com.likelion.attserver.DAO.User;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DAO.Team.TeamDAO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional
public class UserDAOImpl implements UserDAO {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceDAO attendanceDAO;
    private final TeamDAO teamDAO;

    @Override
    public UserDTO addUser(AuthDTO user) {
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
    public LinkedHashMap<String, Object> findDetails(String id) {
        UserEntity user = userRepository.findById(Long.parseLong(id))
                .orElseThrow(() -> new IllegalArgumentException("잘못된 ID"));

        LinkedHashMap<String, Object> details = new LinkedHashMap<>();
        details.put("id", id);
        details.put("name", user.getName());
        details.put("role", user.getRole());
        return details;
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
}