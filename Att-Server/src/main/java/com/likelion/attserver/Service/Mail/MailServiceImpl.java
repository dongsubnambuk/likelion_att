package com.likelion.attserver.Service.Mail;

import com.likelion.attserver.DAO.User.UserDAO;
import com.likelion.attserver.Exception.CustomException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender javaMailSender;
    @Value("${spring.mail.username}")
    private String senderEmail;
    private static int number;
    private final UserDAO userDAO;
    private final Map<String, Integer> numberMap = new HashMap<>();

    // 랜덤으로 숫자 생성
    public static void createNumber() {
        number = (int)(Math.random() * (90000)) + 100000; //(int) Math.random() * (최댓값-최소값+1) + 최소값
    }

    @Override
    public MimeMessage CreateMail(String mail) {
        createNumber();
        numberMap.put(mail, number);
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            message.setFrom(senderEmail);
            message.setRecipients(MimeMessage.RecipientType.TO, mail);
            message.setSubject("멋쟁이 사자처럼 계명대 이메일 인증");
            String body = "";
            body += "<h3>" + "요청하신 인증 번호입니다." + "</h3>";
            body += "<h1>" + number + "</h1>";
            body += "<h3>" + "감사합니다." + "</h3>";
            message.setText(body,"UTF-8", "html");
        } catch (MessagingException e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return message;
    }

    @Override
    public void sendMail(String mail) {
        if (!userDAO.existsEmail(mail))
            throw new CustomException("등록되지 않은 이메일", HttpStatus.BAD_REQUEST);
        MimeMessage message = CreateMail(mail);
        javaMailSender.send(message);
    }

    @Override
    public void checkMail(String mail, int number) {
        if (!numberMap.containsKey(mail) || numberMap.get(mail) != number)
            throw new CustomException("인증번호 틀림", HttpStatus.BAD_REQUEST);
        else
            numberMap.remove(mail, number);
    }
}
