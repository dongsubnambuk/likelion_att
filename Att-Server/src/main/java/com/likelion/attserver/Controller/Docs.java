package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;
import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Docs.DocsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/docs")
@CrossOrigin("http://127.0.0.1:3000")
@RequiredArgsConstructor
public class Docs {
    private final DocsService docsService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody DocsDTO dto) {
        return ResponseEntity.ok(docsService.create(dto));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(docsService.getAll());
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam Long id) {
        docsService.deleteDocs(id);
        return ResponseEntity.ok(StatusDTO.builder()
                        .content(id + " deleted")
                        .build());
    }

    @DeleteMapping("/team")
    public ResponseEntity<?> deleteTeamDocs(@RequestParam Long teamId) {
        docsService.deleteTeamDocs(teamId);
        return ResponseEntity.ok(StatusDTO.builder()
                .content(teamId + " docs deleted")
                .build());
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody ResponseDocsDTO dto) {
        return ResponseEntity.ok(docsService.updateDocs(dto));
    }
}
