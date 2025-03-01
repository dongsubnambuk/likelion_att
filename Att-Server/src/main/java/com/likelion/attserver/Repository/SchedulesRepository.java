package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.SchedulesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchedulesRepository extends JpaRepository<SchedulesEntity, Long> {
}
