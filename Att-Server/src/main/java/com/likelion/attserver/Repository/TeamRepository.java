package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.SchedulesEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<TeamEntity, Long> {
    @Query(value = "select t.schedules from TeamEntity t where t.id = :teamId")
    List<SchedulesEntity> getSchedulesById(Long teamId);
    TeamEntity getByUsersContaining(UserEntity user);
    boolean existsByUsersContaining(UserEntity user);
}
