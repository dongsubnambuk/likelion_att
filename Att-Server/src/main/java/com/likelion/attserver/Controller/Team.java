package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Exception.CustomException;
import com.likelion.attserver.Service.Team.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@CrossOrigin("http://127.0.0.1:3000")
@Tag(name = "팀 API", description = "팀 생성, 삭제 관련 API")
@RequiredArgsConstructor
public class Team {
    private final TeamService teamService;

    // 새로 생성 가능 / teamId 맞춰서 추가 인원 보내면 기존 팀에 팀원 추가 가능
    // 이미 있는 인원이 오면 팀원 목록에서 삭제
    @Operation(summary = "팀 컨트롤", description = """
            기본적으로 새로 생성/
            teamId 맞춰 추가 인원 수신 시 기존 팀에 추가/
            이미 있는 인원이 오면 목록에서 삭제""")
    @PostMapping
    public ResponseEntity<?> teamControl(@RequestParam Long teamId, @RequestParam String note, @RequestBody List<Long> teamData) {
        return ResponseEntity.ok(teamService.createTeam(teamId, note, teamData));
    }

    // 특정 조 조회
    @Operation(summary = "팀 조회", description = "teamId로 팀 조회")
    @GetMapping
    public ResponseEntity<?> getTeam(@RequestParam Long teamId) {
        return ResponseEntity.ok(teamService.getTeam(teamId));
    }

    // 전체 조 조회
    @Operation(summary = "전체 팀 조회", description = "모든 팀을 조회")
    @GetMapping("/all")
    public ResponseEntity<?> getAllTeam() {
        return ResponseEntity.ok(teamService.getAllTeam());
    }

    @Operation(summary = "팀 삭제", description = "해당 teamId의 팀을 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteTeam(@RequestParam Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.ok(StatusDTO.builder()
                .content("Successfully deleted team " + teamId)
                .build());
    }
}
