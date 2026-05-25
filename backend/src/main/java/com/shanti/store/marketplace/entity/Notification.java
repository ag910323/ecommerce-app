package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.enums.NotificationType;
import com.shanti.store.marketplace.enums.ReferenceType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Notification extends BaseEntity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    private Long referenceId;

    @Builder.Default
    private boolean isRead = false;
    
    private String redirectUrl;
    
}