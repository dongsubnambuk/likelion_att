package com.likelion.attserver.Service.Docs;

import com.likelion.attserver.DAO.Docs.DocsDAO;
import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;
import com.likelion.attserver.Exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DocsServiceImpl implements DocsService {
    private final DocsDAO docsDAO;

    @Override
    public ResponseDocsDTO create(DocsDTO dto) {
        try{
            return docsDAO.createDocs(dto);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public LinkedHashMap<Long, List<ResponseDocsDTO>> getAll() {
        try {
            return docsDAO.getAll();
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void deleteTeamDocs(Long teamId) {
        try {
            docsDAO.deleteTeamDocs(teamId);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void deleteDocs(Long id) {
        try {
            docsDAO.deleteDocs(id);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseDocsDTO updateDocs(ResponseDocsDTO responseDocsDTO) {
        try {
            return docsDAO.updateDocs(responseDocsDTO);
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
