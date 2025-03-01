package com.likelion.attserver.Service.Team;

import com.likelion.attserver.DAO.Team.TeamDAO;
import com.likelion.attserver.DTO.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamDAO teamDAO;

    @Override
    public Map<String, Long> createTeam(Long teamId, List<Long> teamData) {
        try{
            Map<String, Long> result = new HashMap<>();
            result.put("Team", teamDAO.addTeam(teamId, teamData));
            return result;
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }

    @Override
    public List<UserDTO> getTeam(Long teamId) {
        try{
            return teamDAO.getTeam(teamId);
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }

    @Override
    public Map<Long, List<UserDTO>> getAllTeam() {
        try{
            return teamDAO.getTeams();
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    }
}