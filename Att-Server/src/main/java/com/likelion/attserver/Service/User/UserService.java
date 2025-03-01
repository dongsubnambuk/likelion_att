package com.likelion.attserver.Service.User;

import com.likelion.attserver.DTO.UserDTO;

import java.util.List;
import java.util.Map;

public interface UserService {
    List<UserDTO> getUserByRole(String role);
    Map<String, Object> getUsers();
}
