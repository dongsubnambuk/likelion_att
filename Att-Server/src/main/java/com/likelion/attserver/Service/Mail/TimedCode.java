package com.likelion.attserver.Service.Mail;

import java.time.LocalDateTime;

public class TimedCode {
    private final int code;
    private final LocalDateTime createdAt;

    public TimedCode(int code) {
        this.code = code;
        this.createdAt = LocalDateTime.now();
    }

    public int getCode() {
        return code;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
