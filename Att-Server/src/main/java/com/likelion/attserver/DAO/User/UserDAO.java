package com.likelion.attserver.DAO.User;

import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public interface UserDAO {
    UserDTO addUser(AuthDTO user);
    Map<String, Object> signin(Long id, String password);
    List<UserDTO> getUserByRole(String role);
    Map<String, Object> userMap();
    void deleteUser(Long id, String password);
    UserDTO update(AuthDTO user);
    void changePassword(Long id, String password);
    boolean existsEmail(String mail);
}
