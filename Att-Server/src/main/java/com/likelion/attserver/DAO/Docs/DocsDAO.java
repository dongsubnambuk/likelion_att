package com.likelion.attserver.DAO.Docs;

import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;

import java.util.LinkedHashMap;
import java.util.List;

public interface DocsDAO {
    ResponseDocsDTO createDocs(DocsDTO docsDTO);
    LinkedHashMap<Long, List<ResponseDocsDTO>> getAll();
    void deleteTeamDocs(Long teamId);
    void deleteDocs(Long id);
    ResponseDocsDTO updateDocs(ResponseDocsDTO responseDocsDTO);
}
