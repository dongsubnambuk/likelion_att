package com.likelion.attserver.DTO;

import com.likelion.attserver.Entity.UserEntity;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserDTO {
    private Long studentId;
    private String name;
    private Long phone;
    private UserEntity.Track track;
    private UserEntity.Role role;
}
