package com.shanti.store.marketplace.response;

import java.time.LocalDateTime;

import com.shanti.store.marketplace.enums.NotificationType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private boolean isRead;
    private NotificationType type;
    private Long referenceId;
    private LocalDateTime createdAt;
    private String redirectUrl;
}