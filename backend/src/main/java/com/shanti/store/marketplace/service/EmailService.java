package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.dto.EmailDetails;

public interface EmailService {
	
	void sendEmail(EmailDetails emailDetails);
	
    void sendSimpleEmail(String to, String subject, String body);
    
    void sendHtmlEmail(String to, String subject, String htmlBody);
    
    void sendTemplateEmail(String to, String subject, String templateName, Object model);
}
