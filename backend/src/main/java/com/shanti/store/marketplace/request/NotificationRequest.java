package com.shanti.store.marketplace.request;

import com.shanti.store.marketplace.enums.NotificationType;
import com.shanti.store.marketplace.enums.ReferenceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    private Long userId;

    private String title;

    private String message;

    private NotificationType type;

    private ReferenceType referenceType;

    private Long referenceId;
    
    private String redirectUrl;
    
}