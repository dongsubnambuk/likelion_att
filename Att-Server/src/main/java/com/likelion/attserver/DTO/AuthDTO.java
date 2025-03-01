package com.likelion.attserver.DTO;

import com.likelion.attserver.Entity.UserEntity;
import lombok.*;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class AuthDTO {
    private Long id;
    private String name;
    private String password;
    private UserEntity.Role role;
}
