package com.likelion.attserver.Service.Attendance;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.Exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
