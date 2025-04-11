package com.likelion.attserver.Service.Mail;

import com.likelion.attserver.DAO.User.UserDAO;
import com.likelion.attserver.Exception.CustomException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender javaMailSender;
    @Value("${spring.mail.username}")
    private String senderEmail;
    private static int number;
    private final UserDAO userDAO;
    private final Map<Long, TimedCode> numberMap = new ConcurrentHashMap<>();

    // 랜덤으로 숫자 생성
    public static void createNumber() {
        number = (int)(Math.random() * 90000) + 100000;
    }

    @Override
    public MimeMessage CreateMail(String mail, Long id) {
        createNumber();
        numberMap.put(id, new TimedCode(number));
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            message.setFrom(new InternetAddress(senderEmail, "멋쟁이 사자처럼 계명대"));
            message.setRecipients(MimeMessage.RecipientType.TO, mail);
            message.setSubject("멋쟁이 사자처럼 계명대 이메일 인증");

            String body = getMailMessage();

            message.setText(body, "UTF-8", "html");
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new CustomException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return message;
    }

    private static String getMailMessage() {
        String body = "";
        body += "<div style='font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;'>";
        body += "  <h2 style='color: #333;'>🦁 멋쟁이 사자처럼 계명대</h2>";
        body += "  <p style='font-size: 16px; color: #555;'>요청하신 인증 번호를 아래에 안내드립니다.</p>";
        body += "  <div style='font-size: 28px; font-weight: bold; color: #4a90e2; background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;'>";
        body +=        number;
        body += "  </div>";
        body += "  <p style='font-size: 14px; color: #888;'>해당 인증 번호는 10분간 유효합니다.</p>";
        body += "  <p style='font-size: 16px; color: #555;'>감사합니다.<br>멋쟁이 사자처럼 계명대 드림 🦁</p>";
        body += "</div>";
        return body;
    }

    @Override
    public void sendMail(Long id) {
        if (!userDAO.existsId(id))
            throw new CustomException("등록되지 않은 학번", HttpStatus.BAD_REQUEST);
        MimeMessage message = CreateMail(userDAO.getEmailById(id), id);
        javaMailSender.send(message);
    }

    @Override
    public void checkMail(Long id, int number) {
        TimedCode timedCode = numberMap.get(id);
        if (timedCode == null)
            throw new CustomException("인증번호 없음", HttpStatus.BAD_REQUEST);

        // 유효시간 체크
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(timedCode.getCreatedAt(), now);
        if (duration.toMinutes() > 10) {
            numberMap.remove(id);
            throw new CustomException("인증번호 만료됨", HttpStatus.BAD_REQUEST);
        }

        // 번호 확인
        if (timedCode.getCode() != number)
            throw new CustomException("인증번호 틀림", HttpStatus.BAD_REQUEST);

        numberMap.remove(id);
    }

    // 🧹 만료된 인증번호 주기적 정리 (1분마다 실행)
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        numberMap.entrySet().removeIf(entry ->
                Duration.between(entry.getValue().getCreatedAt(), now).toMinutes() > 10
        );
    }
}
