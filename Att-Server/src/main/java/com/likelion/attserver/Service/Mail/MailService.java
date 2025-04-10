package com.likelion.attserver.Service.Mail;

import jakarta.mail.internet.MimeMessage;

public interface MailService {
    MimeMessage CreateMail(String mail);

    void sendMail(String mail);

    void checkMail(String mail, int number);
}
