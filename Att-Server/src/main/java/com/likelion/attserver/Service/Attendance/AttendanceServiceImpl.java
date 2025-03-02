package com.likelion.attserver.Service.Attendance;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DTO.AttendanceDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {
    private final AttendanceDAO attendanceDAO;

    @Override
    public List<AttendanceDTO> updateAttendance(List<AttendanceDTO> attendances) {
        try {
            return attendanceDAO.updateAttendance(attendances);
        } catch (Exception e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }
}
