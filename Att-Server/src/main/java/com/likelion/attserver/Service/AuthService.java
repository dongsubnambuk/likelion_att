package com.likelion.attserver.Service;

import com.likelion.attserver.DTO.UserDTO;

import java.util.Map;

public interface AuthService {
    UserDTO signup(UserDTO user);
    Map<String,Object> getDetails(String username);
}
