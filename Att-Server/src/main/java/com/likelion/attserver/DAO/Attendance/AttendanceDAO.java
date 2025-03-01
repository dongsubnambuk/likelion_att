package com.likelion.attserver.DAO.Attendance;

import com.likelion.attserver.Entity.AttendanceEntity;
import com.likelion.attserver.Entity.UserEntity;

import java.util.List;

public interface AttendanceDAO {
    List<AttendanceEntity> addAttendances(List<UserEntity> users);
}
