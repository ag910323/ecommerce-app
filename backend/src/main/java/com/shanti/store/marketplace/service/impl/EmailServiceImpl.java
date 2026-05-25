package com.shanti.store.marketplace.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.shanti.store.marketplace.dto.EmailDetails;
import com.shanti.store.marketplace.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final Environment env; // to get default from email
    
    @Async
    @Override
    public void sendEmail(EmailDetails details) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(env.getProperty("mail.from"));
            helper.setTo(details.getTo());
            helper.setSubject(details.getSubject());

            String content = details.getBody();

            if (details.getTemplateName() != null && details.getModel() != null) {
                Context context = new Context();
                details.getModel().forEach((k, v) -> context.setVariable(k, v));
                content = templateEngine.process(details.getTemplateName(), context);
                helper.setText(content, true);
            } else {
                helper.setText(content, details.isHtml());
            }

            mailSender.send(mimeMessage);
            log.info("Email sent to {}", details.getTo());

        } catch (MessagingException | MailException e) {
            log.error("Failed to send email to {}: {}", details.getTo(), e.getMessage());
        }
    }

    @Async
    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(env.getProperty("mail.from"));
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Simple email sent to {}", to);
        } catch (MailException e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            helper.setFrom(env.getProperty("mail.from"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("HTML email sent to {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    @Override
    public void sendTemplateEmail(String to, String subject, String templateName, Object model) {
        try {
            Context context = new Context();
            if (model instanceof Map<?, ?> map) {
                map.forEach((k, v) -> context.setVariable(k.toString(), v));
            }

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            helper.setFrom(env.getProperty("mail.from"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Template email sent to {} using template {}", to, templateName);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send template email to {}: {}", to, e.getMessage());
        }
    }
}