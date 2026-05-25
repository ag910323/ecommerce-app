package com.shanti.store.marketplace.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.DeliveryPartner;
import com.shanti.store.marketplace.entity.DeliveryPartnerDocument;
import com.shanti.store.marketplace.entity.DeliveryPartnerProfile;
import com.shanti.store.marketplace.response.DeliveryPartnerDocumentResponse;
import com.shanti.store.marketplace.response.DeliveryPartnerProfileResponse;
import com.shanti.store.marketplace.response.DeliveryPartnerResponse;

public class DeliveryPartnerMapper {

    private DeliveryPartnerMapper() {}

    public static DeliveryPartnerResponse toResponse(DeliveryPartner dp) {
        if (dp == null) return null;

        return DeliveryPartnerResponse.builder()
                .id(dp.getId())
                .status(dp.getStatus().name())
                .profile(toProfileResponse(dp.getProfile()))
                .build();
    }

    private static DeliveryPartnerProfileResponse toProfileResponse(DeliveryPartnerProfile profile) {
        if (profile == null) return null;

        List<DeliveryPartnerDocumentResponse> documents = profile.getDocuments() == null ? List.of()
                : profile.getDocuments().stream()
                .map(DeliveryPartnerMapper::toDocumentResponse)
                .collect(Collectors.toList());

        return DeliveryPartnerProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .vehicleType(profile.getVehicleType())
                .vehicleNumber(profile.getVehicleNumber())
                .documents(documents)
                .build();
    }

    private static DeliveryPartnerDocumentResponse toDocumentResponse(DeliveryPartnerDocument doc) {
        return DeliveryPartnerDocumentResponse.builder()
                .id(doc.getId())
                .documentType(doc.getDocumentType())
                .documentUrl(doc.getDocumentUrl())
                .build();
    }
}
