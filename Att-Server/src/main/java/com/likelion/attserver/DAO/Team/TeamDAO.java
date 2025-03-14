package com.likelion.attserver.DAO.Team;

import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Entity.UserEntity;

import java.util.List;
import java.util.Map;

public interface TeamDAO {
    Long addTeam(Long teamId, List<Long> teamData);
    List<UserDTO> getTeam(Long teamId);
    Map<Long, List<UserDTO>> getTeams();
    void removeTeam(Long teamId);
    void deleteUserTeam(UserEntity user);
}
