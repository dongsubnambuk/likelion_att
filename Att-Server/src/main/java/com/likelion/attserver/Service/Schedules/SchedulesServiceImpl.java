package com.likelion.attserver.Service.Schedules;

import com.likelion.attserver.DAO.Schedules.SchedulesDAO;
import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.Exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulesServiceImpl implements SchedulesService {
    private final SchedulesDAO schedulesDAO;

    @Override
    public void createSchedule(Long teamId, List<SchedulesDTO> schedule) {
        try {
            schedulesDAO.addSchedule(teamId, schedule);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public List<LinkedHashMap<String, Object>> getSchedules(Long teamId) {
        try {
            return schedulesDAO.getSchedules(teamId);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public LinkedHashMap<String, List<LinkedHashMap<String, Object>>> getAllSchedules() {
        try {
            return schedulesDAO.getAllSchedules();
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void deleteSchedule(Long teamId, Long id) {
        try {
            schedulesDAO.removeSchedule(teamId, id);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
