package com.likelion.attserver.Service.Schedules;

import com.likelion.attserver.DTO.SchedulesDTO;

public interface SchedulesService {
    void createSchedule(Long teamId, SchedulesDTO schedule);
}
