package com.likelion.attserver.Service.Team;

import com.likelion.attserver.DTO.UserDTO;

import java.util.List;
import java.util.Map;

public interface TeamService {
    Map<String, Long> createTeam(Long teamId, List<Long> teamData);
    List<UserDTO> getTeam(Long teamId);
    Map<Long, List<UserDTO>> getAllTeam();
}
