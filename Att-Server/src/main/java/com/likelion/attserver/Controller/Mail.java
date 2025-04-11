package com.likelion.attserver.Controller;

import com.likelion.attserver.DTO.StatusDTO;
import com.likelion.attserver.Service.Mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@CrossOrigin("https://likelion-13th-att.netlify.app")
@RequiredArgsConstructor
public class Mail {
    private final MailService mailService;

    // 인증 이메일 전송
    @PostMapping("/mail-send")
    public ResponseEntity<StatusDTO> mailSend(@RequestParam Long id) {
        mailService.sendMail(id);
        return ResponseEntity.ok(StatusDTO.builder()
                        .content("발송 성공")
                        .build());
    }

    // 인증번호 일치여부 확인
    @GetMapping("/mail-check")
    public ResponseEntity<?> mailCheck(@RequestParam Long id, @RequestParam int userNumber) {
        mailService.checkMail(id, userNumber);
        return ResponseEntity.ok(StatusDTO.builder().content("성공").build());
    }
}
