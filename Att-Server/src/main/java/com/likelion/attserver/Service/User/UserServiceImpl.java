package com.likelion.attserver.Service.User;

import com.likelion.attserver.DAO.User.UserDAO;
import com.likelion.attserver.DTO.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserDAO userDAO;

    @Override
    public List<UserDTO> getUserByRole(String role) {
        try{
            return userDAO.getUserByRole(role);
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getUsers() {
        try{
            return userDAO.userMap();
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }
}
