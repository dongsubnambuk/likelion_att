package com.likelion.attserver.DAO.Schedules;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Repository.TeamRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class SchedulesDAOImpl implements SchedulesDAO {
    private final TeamRepository teamRepository;
    private final AttendanceDAO attendanceDAO;

    @Override
    public void addSchedule(Long teamId, List<SchedulesDTO> scheduleDTOs) {
        TeamEntity team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team id"));

        // 기존 스케줄 목록을 메모리에서 한 번 조회
        List<SchedulesEntity> existingSchedules = team.getSchedules();

        // 요청된 스케줄 중 중복 체크
        for(SchedulesDTO dto : scheduleDTOs) {
            if (existSchedule(existingSchedules, dto)) {
                log.info("Fail add schedule");
                throw new IllegalStateException(
                        String.format("Schedule already exists: %s %s", dto.getDate(), dto.getTime())
                );
            }

            // 중복 없으면 새 엔티티 추가
            SchedulesEntity schedulesEntity = new SchedulesEntity();
            schedulesEntity.setDate(dto.getDate());
            schedulesEntity.setTime(dto.getTime());
            schedulesEntity.setAttendances(attendanceDAO.addAttendances(team.getUsers()));

            existingSchedules.add(schedulesEntity);
        }

        // 모든 작업 후 한 번에 DB 저장
        teamRepository.save(team);
    }

    private boolean existSchedule(List<SchedulesEntity> schedules, SchedulesDTO dto) {
        return schedules.stream()
                .anyMatch(schedule ->
                        schedule.getDate().equals(dto.getDate()) &&
                                schedule.getTime().equals(dto.getTime())
                );
    }

    @Override
    public List<LinkedHashMap<String, Object>> getSchedules(Long teamId) {
        List<LinkedHashMap<String, Object>> result = new ArrayList<>();
        List<SchedulesEntity> schedules = teamRepository.getSchedulesById(teamId);

        convertScheduleList(schedules, result);

        return result;
    }

    private static void convertScheduleList(List<SchedulesEntity> schedules, List<LinkedHashMap<String, Object>> result) {
        for (SchedulesEntity schedule : schedules) {
            LinkedHashMap<String, Object> scheduleMap = new LinkedHashMap<>();
            scheduleMap.put("id", schedule.getId());
            scheduleMap.put("date", schedule.getDate());
            scheduleMap.put("time", schedule.getTime());

            List<AttendanceDTO> attendanceDTOS = new ArrayList<>();
            for(AttendanceEntity attendance : schedule.getAttendances())
                attendanceDTOS.add(AttendanceEntity.toDTO(attendance));

            scheduleMap.put("attendances", attendanceDTOS);

            result.add(scheduleMap);
        }
    }

    @Override
    public LinkedHashMap<String, List<LinkedHashMap<String, Object>>> getAllSchedules() {
        LinkedHashMap<String, List<LinkedHashMap<String, Object>>> result = new LinkedHashMap<>();
        List<TeamEntity> teams = teamRepository.findAll();
        for(TeamEntity team : teams) {
            result.put(team.getId().toString(), getSchedules(team.getId()));
        }
        return result;
    }

    @Override
    public void removeSchedule(Long teamId, Long id) {
        TeamEntity team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team id"));
        boolean removed = team.getSchedules().removeIf(schedule -> schedule.getId().equals(id));

        if (!removed) {
            throw new NoSuchElementException("Invalid Schedule Id (" + id + ").");
        }
        teamRepository.save(team);
    }
}