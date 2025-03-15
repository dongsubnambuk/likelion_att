package com.likelion.attserver.Entity;

import com.likelion.attserver.DTO.AttendanceDTO;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Attendance")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column
    private String note;

    @Column
    private Long score;

    public enum Status {
        NOT, // 미출결
        PRESENT, // 출석
        LATE, // 지각
        ABSENT // 결석
    }

    public static AttendanceDTO toDTO(AttendanceEntity attendance){
        AttendanceDTO attendanceDTO = new AttendanceDTO();
        attendanceDTO.setId(attendance.getId());
        attendanceDTO.setUser(UserEntity.toDTO(attendance.getUser()));
        attendanceDTO.setNote(attendance.getNote());
        attendanceDTO.setStatus(attendance.getStatus());
        attendanceDTO.setScore(attendance.getScore());
        return attendanceDTO;
    }
}
