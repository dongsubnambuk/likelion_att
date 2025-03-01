package com.likelion.attserver.DAO.Schedules;

import com.likelion.attserver.DTO.SchedulesDTO;
import com.likelion.attserver.Repository.SchedulesRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Transactional
@RequiredArgsConstructor
public class SchedulesDAOImpl implements SchedulesDAO {
    private final SchedulesRepository schedulesRepository;

    @Override
    public void addSchedule(Long teamId, SchedulesDTO schedules) {

    }
}