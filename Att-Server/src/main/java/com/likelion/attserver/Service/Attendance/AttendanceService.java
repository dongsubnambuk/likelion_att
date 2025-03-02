package com.likelion.attserver.Service.Attendance;

import com.likelion.attserver.DTO.AttendanceDTO;

import java.util.List;

public interface AttendanceService {
    List<AttendanceDTO> updateAttendance(List<AttendanceDTO> attendances);
}
