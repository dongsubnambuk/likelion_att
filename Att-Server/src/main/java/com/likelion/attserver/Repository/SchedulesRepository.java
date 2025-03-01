package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.SchedulesEntity;
import jakarta.persistence.Tuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchedulesRepository extends JpaRepository<SchedulesEntity, Long> {
    @Query("SELECT COUNT(s) > 0 FROM SchedulesEntity s WHERE (s.date = :date AND s.time = :time)")
    boolean existsByDateAndTimePairs(@Param("schedules") List<Tuple> schedules);
}
