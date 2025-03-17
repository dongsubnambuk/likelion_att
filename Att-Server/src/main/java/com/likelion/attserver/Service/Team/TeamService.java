package com.likelion.attserver.Service.Team;

import com.likelion.attserver.DTO.UserDTO;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public interface TeamService {
    Map<String, Long> createTeam(Long teamId, String note, List<Long> teamData);
    Map<String, List<UserDTO>> getTeam(Long teamId);
    LinkedHashMap<Long, LinkedHashMap<String, List<UserDTO>>> getAllTeam();
    void deleteTeam(Long teamId);
}
