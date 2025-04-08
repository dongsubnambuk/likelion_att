package com.likelion.attserver.Entity;

import com.likelion.attserver.DTO.Docs.DocsDTO;
import com.likelion.attserver.DTO.Docs.ResponseDocsDTO;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "docs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "teamId", referencedColumnName = "id", nullable = false)
    private TeamEntity team;
    @Column
    private String title;
    @Column
    private String description;
    @Column
    private String content;
    @Column
    private LocalDateTime created;

    public static DocsDTO toDTO(DocsEntity docsEntity) {
        return DocsDTO.builder()
                .teamId(docsEntity.getTeam().getId())
                .title(docsEntity.getTitle())
                .description(docsEntity.getDescription())
                .content(docsEntity.getContent())
                .created(docsEntity.getCreated())
                .build();
    }

    public static ResponseDocsDTO toResponseDTO(DocsEntity docsEntity) {
        return ResponseDocsDTO.builder()
                .id(docsEntity.getId())
                .teamId(docsEntity.getTeam().getId())
                .title(docsEntity.getTitle())
                .description(docsEntity.getDescription())
                .content(docsEntity.getContent())
                .created(docsEntity.getCreated())
                .build();
    }
}
