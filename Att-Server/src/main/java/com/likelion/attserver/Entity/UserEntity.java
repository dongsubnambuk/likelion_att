package com.likelion.attserver.Entity;

import com.likelion.attserver.DTO.UserDTO;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "User")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    private Long id;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // enum 타입으로 선언

    public enum Role {
        ADMIN, // 운영자
        STUDENT // 학생
    }

    public static UserDTO toDTO(UserEntity userEntity) {
        return UserDTO.builder()
                .studentId(userEntity.getId())
                .name(userEntity.getName())
                .role(userEntity.getRole())
                .build();
    }
}
