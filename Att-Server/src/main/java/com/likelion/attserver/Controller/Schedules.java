package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Schedules.SchedulesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class Schedules {
    private final SchedulesService schedulesService;

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestParam Long teamId, @RequestBody SchedulesDTO schedule) {
        try{
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
}
