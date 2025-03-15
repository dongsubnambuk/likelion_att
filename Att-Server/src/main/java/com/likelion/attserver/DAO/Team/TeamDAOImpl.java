package com.likelion.attserver.DAO.Team;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DAO.Schedules.SchedulesDAO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.TeamRepository;
import com.likelion.attserver.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class TeamDAOImpl implements TeamDAO {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AttendanceDAO attendanceDAO;
    private final SchedulesDAO schedulesDAO;

    @Override
    public Long addTeam(Long teamId, List<Long> teamData) {
        if(!teamRepository.existsById(teamId)) {
            List<UserEntity> users = userRepository.findAllById(teamData);
            log.info("Adding team {} to database", teamData);
            TeamEntity teamEntity = new TeamEntity();
            teamEntity.setId(teamId);
            teamEntity.setUsers(users);
            return teamRepository.save(teamEntity).getId();
        } else {
            TeamEntity teamEntity = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));

            for (Long data : teamData) {
                // UserEntity 리스트에서 ID를 비교하여 중복 확인 스트림은 신이야
                boolean exists = teamEntity.getUsers().stream()
                        .anyMatch(user -> user.getId().equals(data));

                UserEntity user = userRepository.findById(data)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!exists) {
                    teamEntity.getUsers().add(user);

                    // 이미 있는 스케쥴에 출석 추가
                    for(SchedulesEntity schedule : teamEntity.getSchedules()) {
                        schedule.getAttendances().add(attendanceDAO.addAttendance(user));
                    }
                } else {
                    teamEntity.getSchedules().forEach(schedule ->
                            schedule.getAttendances().removeIf(attendanceEntity ->
                                    attendanceEntity.getUser().equals(user)
                            )
                    );
                    teamEntity.getUsers().remove(user);
                }
            }
            return teamRepository.save(teamEntity).getId();
        }
    }

    @Override
    public List<UserDTO> getTeam(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"))
                .getUsers().stream()
                .map(user -> UserDTO.builder()
                        .studentId(user.getId())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .toList();
    }

    @Override
    public Map<Long, List<UserDTO>> getTeams() {
        Map<Long, List<UserDTO>> teamMap = new HashMap<>();
        List<TeamEntity> teams = teamRepository.findAll();

        for(TeamEntity team : teams) {
            List<UserDTO> users = team.getUsers().stream()
                    .map(user -> UserDTO.builder()
                            .studentId(user.getId())
                            .name(user.getName())
                            .role(user.getRole())
                            .build())
                    .collect(Collectors.toList());

            teamMap.put(team.getId(), users);
        }

        return teamMap;
    }

    @Override
    public void removeTeam(Long teamId) {
        TeamEntity team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        teamRepository.delete(team);
    }

    @Override
    public void deleteUserTeam(UserEntity user) {
        TeamEntity team = teamRepository.getByUsersContaining(user);
        schedulesDAO.deleteUserSchedule(team.getSchedules(), user);
        team.getUsers().remove(user);
        teamRepository.save(team);
    }
}