package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, Long> {
    List<AttendanceEntity> findAllByUser(UserEntity userEntity);
}
