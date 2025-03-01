package com.likelion.attserver.Service.Schedules;

import com.likelion.attserver.DAO.Schedules.SchedulesDAO;
import com.likelion.attserver.DTO.SchedulesDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchedulesServiceImpl implements SchedulesService {
    private final SchedulesDAO schedulesDAO;

    @Override
    public void createSchedule(Long teamId, SchedulesDTO schedule) {
        try {
            schedulesDAO.addSchedule(teamId, schedule);
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }
}
