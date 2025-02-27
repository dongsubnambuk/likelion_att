package com.likelion.attserver.DAO;

import com.likelion.attserver.DTO.UserDTO;

import java.util.Map;
import java.util.Objects;

public interface UserDAO {
    UserDTO addUser(UserDTO user);
    Map<String, Object> findDetails(String id);
}
