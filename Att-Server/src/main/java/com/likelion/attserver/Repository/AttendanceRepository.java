package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.SchedulesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<SchedulesEntity, Long> {
}
