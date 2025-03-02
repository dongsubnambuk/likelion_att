package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Attendance.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/att")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class Attendance {
    private final AttendanceService attendanceService;

    // List 형식으로 받음으로서 한방에 여러개 가능.
    @PutMapping
    public ResponseEntity<?> updateAttendances(@RequestBody List<AttendanceDTO> attendanceDTO) {
        try {
            return ResponseEntity.ok(attendanceService.updateAttendance(attendanceDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }
}
