package com.likelion.attserver.DAO.Attendance;

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
}
