package com.likelion.attserver.Service.Team;

import com.likelion.attserver.DAO.Team.TeamDAO;
import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamDAO teamDAO;

    @Override
    public Map<String, Long> createTeam(Long teamId, String note, List<Long> teamData) {
        try{
            Map<String, Long> result = new HashMap<>();
            result.put("Team", teamDAO.addTeam(teamId, note, teamData));
            return result;
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public Map<String, List<UserDTO>> getTeam(Long teamId) {
        try{
            return teamDAO.getTeam(teamId);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public LinkedHashMap<Long, LinkedHashMap<String, List<UserDTO>>> getAllTeam() {
        try{
            return teamDAO.getTeams();
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void deleteTeam(Long teamId) {
        try {
            teamDAO.removeTeam(teamId);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}