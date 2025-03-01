package com.likelion.attserver.DAO.Schedules;

import com.likelion.attserver.DTO.SchedulesDTO;

public interface SchedulesDAO {
    void addSchedule(Long teamId, SchedulesDTO schedules);
}
