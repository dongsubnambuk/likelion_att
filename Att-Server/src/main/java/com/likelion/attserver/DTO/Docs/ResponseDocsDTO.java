package com.likelion.attserver.DTO.Docs;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDocsDTO {
    private Long id;
    private Long teamId;
    private String title;
    private String description;
    private String content;
    private LocalDateTime created;
}
