package com.likelion.attserver.DAO.Schedules;

import com.likelion.attserver.DAO.Attendance.AttendanceDAO;
import com.likelion.attserver.DTO.AttendanceDTO;
import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;
import com.likelion.attserver.Repository.AttendanceRepository;
import com.likelion.attserver.Repository.SchedulesRepository;
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
    private final SchedulesRepository schedulesRepository;
    private final AttendanceRepository attendanceRepository;

    public boolean existSchedule(List<SchedulesEntity> schedules, SchedulesDTO schedulesDTO) {
        for(SchedulesEntity schedule : schedules) {
            if (schedule.getDate().equals(schedulesDTO.getDate()) &&
                    schedule.getTime().equals(schedulesDTO.getTime()))
                return true;
        }
        return false;
    }

    // 왜 처음 한개는 되는데 그 다음 부터는 안돼지? 흠..
    @Override
    public void addSchedule(Long teamId, SchedulesDTO schedule) {
        if(!existSchedule(teamRepository.getSchedulesById(teamId), schedule)) {
            log.info("Completed checking for schedule presence");
            TeamEntity team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid team id"));

            SchedulesEntity schedulesEntity = new SchedulesEntity();
            schedulesEntity.setDate(schedule.getDate());
            schedulesEntity.setTime(schedule.getTime());
            // 개헷갈리네 슈밤바
            schedulesEntity.setAttendances(attendanceDAO.addAttendances(team.getUsers()));

            team.getSchedules().add(schedulesEntity);
            teamRepository.save(team);
        } else {
            log.info("Fail add schedule");
            throw new IllegalStateException("Schedule already exists");
        }
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

    @Override
    public void deleteUserSchedule(List<SchedulesEntity> schedules, UserEntity user) {
        for (SchedulesEntity schedule : schedules) {
            log.info("Delete schedule presence");
            schedule.getAttendances().removeIf(attendance -> attendance.getUser().equals(user));
            log.info("Delete user presence");
        }
    }
}