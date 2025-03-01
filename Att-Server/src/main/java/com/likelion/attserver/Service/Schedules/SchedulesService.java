package com.likelion.attserver.Service.Schedules;

import com.likelion.attserver.DTO.SchedulesDTO;

import java.util.LinkedHashMap;
import java.util.List;

public interface SchedulesService {
    void createSchedule(Long teamId, SchedulesDTO schedule);
    List<LinkedHashMap<String, Object>> getSchedules(Long teamId);
}
