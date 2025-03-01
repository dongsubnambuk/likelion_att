package com.likelion.attserver.DAO.Attendance;

import com.likelion.attserver.Repository.AttendanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Transactional
@RequiredArgsConstructor
public class AttendanceDAOImpl implements AttendanceDAO {
    private final AttendanceRepository attendanceRepository;
}
