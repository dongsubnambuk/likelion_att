package com.likelion.attserver.DAO.Attendance;

import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.AttendanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Transactional
@RequiredArgsConstructor
public class AttendanceDAOImpl implements AttendanceDAO {
    private final AttendanceRepository attendanceRepository;

    @Override
    public List<AttendanceEntity> addAttendances(List<UserEntity> users) {
        List<AttendanceEntity> attendances = new ArrayList<>();
        for(UserEntity user : users) {
            AttendanceEntity attendance = new AttendanceEntity();
            attendance.setUser(user);
            attendance.setStatus(AttendanceEntity.Status.NOT);
            attendances.add(attendance);
        }
        return attendances;
    }

    @Override
    public AttendanceEntity addAttendance(UserEntity user) {
        return AttendanceEntity.builder()
                .user(user)
                .status(AttendanceEntity.Status.NOT)
                .build();
    }

    @Override
    public List<AttendanceDTO> updateAttendance(List<AttendanceDTO> attendances) {
        List<AttendanceDTO> updatedAttendances = new ArrayList<>();
        for(AttendanceDTO attendance : attendances) {
            AttendanceEntity attendanceEntity = attendanceRepository.findById(attendance.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid attendance ID"));
            attendanceEntity.setStatus(attendance.getStatus());
            attendanceEntity.setNote(attendance.getNote());
            attendanceEntity.setScore(attendance.getScore());
            attendanceRepository.save(attendanceEntity);
            updatedAttendances.add(AttendanceEntity.toDTO(attendanceEntity));
        }
        return updatedAttendances;
    }
}
