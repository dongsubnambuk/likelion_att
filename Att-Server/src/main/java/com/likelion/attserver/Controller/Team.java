package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Team.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@CrossOrigin("http://localhost")
@RequiredArgsConstructor
public class Team {
    private final TeamService teamService;

    // 새로 생성 가능 / teamId 맞춰서 추가 인원 보내면 기존 팀에 팀원 추가 가능, 자동으로 중복 인원 필터 가능
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestParam Long teamId, @RequestBody List<Long> teamData) {
        try{
            return ResponseEntity.ok(teamService.createTeam(teamId, teamData));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    // 특정 조 조회
    @GetMapping
    public ResponseEntity<?> getTeam(@RequestParam Long teamId) {
        try{
            return ResponseEntity.ok(teamService.getTeam(teamId));
        } catch (Exception e) {
            return ResponseEntity.status(4043).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }

    // 전체 조 조회
    @GetMapping("/all")
    public ResponseEntity<?> getAllTeam() {
        try{
            return ResponseEntity.ok(teamService.getAllTeam());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(StatusDTO.builder()
                            .content(e.getMessage())
                            .build());
        }
    }
}
