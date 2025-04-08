package com.likelion.attserver.Service.Docs;

import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;

import java.util.LinkedHashMap;
import java.util.List;

public interface DocsService {
    ResponseDocsDTO create(DocsDTO dto);
    LinkedHashMap<Long, List<ResponseDocsDTO>> getAll();
    void deleteTeamDocs(Long teamId);
    void deleteDocs(Long id);
    ResponseDocsDTO updateDocs(ResponseDocsDTO responseDocsDTO);
}
