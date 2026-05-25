package com.shanti.store.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDetails {
    private String to;                 // recipient
    private String subject;            // subject line
    private String body;               // plain text or fallback
    private boolean isHtml;            // true if HTML
    private String templateName;       // optional Thymeleaf template
    private Map<String, Object> model; // template variables
}
