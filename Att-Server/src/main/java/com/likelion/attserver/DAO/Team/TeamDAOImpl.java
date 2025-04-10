package com.likelion.attserver.DAO.Team;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DAO.Docs.DocsDAO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.AttendanceRepository;
import com.likelion.attserver.Repository.SchedulesRepository;
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
    private final SchedulesRepository schedulesRepository;
    private final AttendanceRepository attendanceRepository;
    private final DocsDAO docsDAO;

    @Override
    public Long addTeam(Long teamId, String note, List<Long> teamData) {
        if(!teamRepository.existsById(teamId)) {
            List<UserEntity> users = userRepository.findAllById(teamData);
            log.info("Adding team {} to database", teamData);
            TeamEntity teamEntity = new TeamEntity();
            teamEntity.setId(teamId);
            teamEntity.setNote(note);
            teamEntity.setUsers(users);
            return teamRepository.save(teamEntity).getId();
        } else {
            TeamEntity teamEntity = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            teamEntity.setNote(note);
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
    public Map<String, List<UserDTO>> getTeam(Long teamId) {
        TeamEntity team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        Map<String, List<UserDTO>> result = new HashMap<>();
        result.put(team.getNote(), team.getUsers().stream()
                .map(user -> UserDTO.builder()
                        .studentId(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .track(user.getTrack())
                        .role(user.getRole())
                        .build())
                .toList());
        return result;
    }

    @Override
    public LinkedHashMap<Long, LinkedHashMap<String, List<UserDTO>>> getTeams() {
        LinkedHashMap<Long, LinkedHashMap<String, List<UserDTO>>> result = new LinkedHashMap<>();
        List<TeamEntity> teams = teamRepository.findAll();

        for(TeamEntity team : teams) {
            LinkedHashMap<String, List<UserDTO>> teamMap = new LinkedHashMap<>();
            List<UserDTO> users = team.getUsers().stream()
                    .map(user -> UserDTO.builder()
                            .studentId(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .track(user.getTrack())
                            .role(user.getRole())
                            .build())
                    .collect(Collectors.toList());

            teamMap.put(team.getNote(), users);
            result.put(team.getId(), teamMap);
        }

        return result;
    }

    @Override
    public void removeTeam(Long teamId) {
        TeamEntity team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        docsDAO.deleteTeamDocs(teamId);
        teamRepository.delete(team);
    }

    @Override
    public void deleteUserTeam(UserEntity user) {
        if(teamRepository.existsByUsersContaining(user)) {
            TeamEntity team = teamRepository.getByUsersContaining(user);
            for (SchedulesEntity schedule : team.getSchedules()) {
                List<AttendanceEntity> attendances = schedule.getAttendances();
                for (AttendanceEntity attendance : attendances) {
                    if (attendance.getUser().equals(user)) {
                        attendances.remove(attendance);
                        attendanceRepository.delete(attendance);
                    }
                }
                log.info("Delete user attendance presence");
                schedulesRepository.save(schedule);
                log.info("Delete user schedule presence");
            }
            team.getUsers().remove(user);
            teamRepository.save(team);
        }
    }
}