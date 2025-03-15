package com.likelion.attserver.DAO.Schedules;

import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.UserEntity;

import java.util.LinkedHashMap;
import java.util.List;

public interface SchedulesDAO {
    void addSchedule(Long teamId, SchedulesDTO schedules);
    List<LinkedHashMap<String, Object>> getSchedules(Long teamId);
    LinkedHashMap<String, List<LinkedHashMap<String, Object>>> getAllSchedules();
    void removeSchedule(Long teamId, Long id);
    void deleteUserSchedule(List<SchedulesEntity> schedules, UserEntity user);
}
