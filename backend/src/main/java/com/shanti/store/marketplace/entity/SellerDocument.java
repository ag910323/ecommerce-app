package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.SellerDocumentConstants;
import com.shanti.store.marketplace.enums.DocumentContext;
import com.shanti.store.marketplace.enums.DocumentType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = SellerDocumentConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = SellerDocumentConstants.COL_SELLER_PROFILE, nullable = false)
    @ToString.Exclude
    private SellerProfile sellerProfile;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;
    
    @Enumerated(EnumType.STRING)
    private DocumentContext documentContext;
    
    @Column(name = SellerDocumentConstants.COL_DOCUMENT_URL, nullable = false)
    private String documentUrl;

    @Column(name = SellerDocumentConstants.COL_REMARKS)
    private String remarks;
}
