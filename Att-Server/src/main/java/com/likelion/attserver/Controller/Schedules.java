package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Schedules.SchedulesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin("http://127.0.0.1:3000")
@Tag(name = "스케쥴 API", description = "스케쥴 생성, 삭제 등 스케쥴 관련 API")
@RequiredArgsConstructor
public class Schedules {
    private final SchedulesService schedulesService;

    @Operation(summary = "스케쥴 생성", description = "teamId와 scheduleDTO로 스케쥴 생성")
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestParam Long teamId, @RequestBody SchedulesDTO schedule) {
        schedulesService.createSchedule(teamId, schedule);
        return ResponseEntity.ok(StatusDTO.builder()
                .content("Schedule created")
                .build());
    }

    @Operation(summary = "스케쥴 조회", description = "teamId와 연관된 모든 스케쥴 조회")
    @GetMapping
    public ResponseEntity<?> getSchedules(@RequestParam Long teamId) {
        return ResponseEntity.ok(schedulesService.getSchedules(teamId));
    }

    @Operation(summary = "스케쥴 전체 조회", description = "모든 스케쥴 조회")
    @GetMapping("/all")
    public ResponseEntity<?> getAllSchedules() {
        return ResponseEntity.ok(schedulesService.getAllSchedules());
    }

    @Operation(summary = "스케쥴 삭제", description = "teamId와 schedule의 Id로 해당 스케쥴 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteSchedule(@RequestParam Long teamId, @RequestParam Long id) {
        schedulesService.deleteSchedule(teamId, id);
        return ResponseEntity.ok(StatusDTO.builder()
                .content("Schedule deleted")
                .build());
    }
}
