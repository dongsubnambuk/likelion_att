package com.likelion.attserver.DTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchedulesDTO {
    private LocalDate date;
    private LocalTime time;
}
