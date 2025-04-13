package com.likelion.attserver.DAO.Docs;

import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;
import com.likelion.attserver.Entity.DocsEntity;
import com.likelion.attserver.Entity.TeamEntity;
import com.likelion.attserver.Exception.CustomException;
import com.likelion.attserver.Repository.DocsRepository;
import com.likelion.attserver.Repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DocsDAOImpl implements DocsDAO {
    private final DocsRepository docsRepository;
    private final TeamRepository teamRepository;

    @Override
    public ResponseDocsDTO createDocs(DocsDTO docsDTO) {
        DocsEntity docsEntity = DocsEntity.builder()
                .team(teamRepository.findById(docsDTO.getTeamId())
                        .orElseThrow(() -> new CustomException("Team not found", HttpStatus.NOT_FOUND)))
                .title(docsDTO.getTitle())
                .description(docsDTO.getDescription())
                .content(docsDTO.getContent())
                .created(docsDTO.getCreated())
                .build();
        docsRepository.save(docsEntity);
        return ResponseDocsDTO.builder()
                .id(docsEntity.getId())
                .teamId(docsEntity.getTeam().getId())
                .title(docsEntity.getTitle())
                .description(docsEntity.getDescription())
                .content(docsEntity.getContent())
                .created(docsEntity.getCreated())
                .build();
    }

    @Override
    public LinkedHashMap<Long, List<ResponseDocsDTO>> getAll() {
        List<TeamEntity> teamEntities = teamRepository.findAll();
        LinkedHashMap<Long, List<ResponseDocsDTO>> result = new LinkedHashMap<>();
        for (TeamEntity teamEntity : teamEntities) {
            List<ResponseDocsDTO> docsDTOList = new ArrayList<>();
            List<DocsEntity> docsEntities = docsRepository.findByTeamId(teamEntity.getId());
            for (DocsEntity docsEntity : docsEntities) {
                docsDTOList.add(DocsEntity.toResponseDTO(docsEntity));
            }
            result.put(teamEntity.getId(), docsDTOList);
        }
        return result;
    }

    @Override
    public void deleteTeamDocs(Long teamId) {
        if (!teamRepository.existsById(teamId))
            throw new CustomException("Team not found", HttpStatus.NOT_FOUND);
        else if (!docsRepository.existsByTeamId(teamId)) return;
        docsRepository.deleteAll(docsRepository.findByTeamId(teamId));
    }

    @Override
    public void deleteDocs(Long id) {
        if (!docsRepository.existsById(id))
            throw new CustomException("Docs not found", HttpStatus.NOT_FOUND);
        docsRepository.deleteById(id);
    }

    @Override
    public ResponseDocsDTO updateDocs(ResponseDocsDTO responseDocsDTO) {
        DocsEntity docsEntity = docsRepository.findById(responseDocsDTO.getId())
                .orElseThrow(() -> new CustomException("Docs not found", HttpStatus.NOT_FOUND));
        docsEntity.setTitle(responseDocsDTO.getTitle());
        docsEntity.setDescription(responseDocsDTO.getDescription());
        docsEntity.setContent(responseDocsDTO.getContent());
        docsEntity.setCreated(responseDocsDTO.getCreated());
        docsRepository.save(docsEntity);
        return responseDocsDTO;
    }
}
