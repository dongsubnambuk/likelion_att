package com.likelion.attserver.Service.Auth;

import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;

import java.util.Map;

public interface AuthService {
    UserDTO signup(AuthDTO user);
    Map<String, Object> signin(Long id, String password);
}
