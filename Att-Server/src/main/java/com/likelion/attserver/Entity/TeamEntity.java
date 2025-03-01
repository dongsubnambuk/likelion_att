package com.likelion.attserver.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "team")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamEntity {
    @Id
    private Long id;

    @OneToMany
    private List<UserEntity> users;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SchedulesEntity> schedules;
}