package com.likelion.attserver.Service.Mail;

import jakarta.mail.internet.MimeMessage;

public interface MailService {
    MimeMessage CreateMail(String mail, Long id);

    String sendMail(Long id);

    void checkMail(Long id, int number);
}
