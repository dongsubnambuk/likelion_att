package com.likelion.attserver.DAO.Team;

import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public interface TeamDAO {
    Long addTeam(Long teamId, String note, List<Long> teamData);
    Map<String, List<UserDTO>> getTeam(Long teamId);
    LinkedHashMap<Long, LinkedHashMap<String, List<UserDTO>>> getTeams();
    void removeTeam(Long teamId);
    Long deleteUserTeam(UserEntity user);
}
