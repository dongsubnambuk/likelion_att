package com.likelion.attserver.DTO;

import com.likelion.attserver.Entity.AttendanceEntity;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private UserDTO user;
    private AttendanceEntity.Status status;
    private String note;
    private Long score;
}
