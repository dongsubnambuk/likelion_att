package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Attendance.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/att")
@CrossOrigin("http://127.0.0.1:3000")
@Tag(name = "출석 API", description = "출석 관련 API")
@RequiredArgsConstructor
public class Attendance {
    private final AttendanceService attendanceService;

    // List 형식으로 받음으로서 한방에 여러개 가능.
    @Operation(summary = "출석 수정", description = """
            attendanceDTO에 맞게 보내면 수정됨.
            List형식으로 보내야하며, 리스트에 여러개 보낼 시 한번에 수정 가능""")
    @PutMapping
    public ResponseEntity<?> updateAttendances(@RequestBody List<AttendanceDTO> attendanceDTO) {
        return ResponseEntity.ok(attendanceService.updateAttendance(attendanceDTO));
    }
}
