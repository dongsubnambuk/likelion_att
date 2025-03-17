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

    @Column(nullable = false)
    private Long phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Track track;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // enum 타입으로 선언

    public enum Role {
        ADMIN, // 운영자
        STUDENT // 학생
    }

    public enum Track{
        EduFront, // 프론트 교육반
        EduBack, // 백엔드 교육반
        ProFront, // 프론트 프로젝트반
        ProBack // 백엔드 프로젝트반
    }

    public static UserDTO toDTO(UserEntity userEntity) {
        return UserDTO.builder()
                .studentId(userEntity.getId())
                .name(userEntity.getName())
                .track(userEntity.getTrack())
                .role(userEntity.getRole())
                .build();
    }
}
