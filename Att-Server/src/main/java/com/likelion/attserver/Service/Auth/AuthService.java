package com.likelion.attserver.Service.Auth;

import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;

import java.util.LinkedHashMap;

public interface AuthService {
    UserDTO signup(AuthDTO user);
    LinkedHashMap<String,Object> getDetails(String username);
}
