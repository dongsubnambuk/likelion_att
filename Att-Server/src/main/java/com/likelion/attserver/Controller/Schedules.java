package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Schedules.SchedulesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin("http://127.0.0.1:3000")
@RequiredArgsConstructor
public class Schedules {
    private final SchedulesService schedulesService;

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestParam Long teamId, @RequestBody SchedulesDTO schedule) {
        try {
            schedulesService.createSchedule(teamId, schedule);
            return ResponseEntity.ok(StatusDTO.builder()
                            .content("Schedule created")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(404).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    @GetMapping
    public ResponseEntity<?> getSchedules(@RequestParam Long teamId) {
        try {
            return ResponseEntity.ok(schedulesService.getSchedules(teamId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllSchedules() {
        try {
            return ResponseEntity.ok(schedulesService.getAllSchedules());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteSchedule(@RequestParam Long teamId, @RequestParam Long id) {
        try {
            schedulesService.deleteSchedule(teamId, id);
            return ResponseEntity.ok(StatusDTO.builder()
                            .content("Schedule deleted")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }
}
