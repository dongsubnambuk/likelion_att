package com.likelion.attserver.Service.Auth;

import com.likelion.attserver.DAO.User.UserDAO;
import com.likelion.attserver.DTO.AuthDTO;
import com.likelion.attserver.DTO.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserDAO userDAO;

    @Override
    public UserDTO signup(AuthDTO user){
        try {
            return userDAO.addUser(user);
        } catch (Exception e) {
            throw new IllegalStateException("회원가입 실패");
        }
    }

    @Override
    public Map<String, Object> getDetails(String username) {
        try{
            return userDAO.findDetails(username);
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }
}
