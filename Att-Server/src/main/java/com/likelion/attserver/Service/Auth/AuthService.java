package com.likelion.attserver.Service.Auth;

import com.likelion.attserver.DTO.AuthDTO;

import java.util.Map;

public interface AuthService {
    AuthDTO signup(AuthDTO user);
    Map<String,Object> getDetails(String username);
}
