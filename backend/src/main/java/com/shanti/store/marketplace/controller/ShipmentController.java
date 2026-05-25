//package com.shanti.store.marketplace.controller;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import com.shanti.store.marketplace.builder.ApiResponseBuilder;
//import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
//import com.shanti.store.marketplace.response.ApiResponse;
//import com.shanti.store.marketplace.response.ShipmentResponse;
//import com.shanti.store.marketplace.service.ShipmentService;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/shipments")
//@RequiredArgsConstructor
//public class ShipmentController {
//
//    private final ShipmentService shipmentService;
//
//    @PutMapping("/{shipmentId}/status")
//    public ResponseEntity<ApiResponse<ShipmentResponse>> updateShipmentStatus(
//            @PathVariable Long shipmentId,
//            @RequestBody UpdateShipmentStatusRequest request) {
//
//        ShipmentResponse response = shipmentService.updateShipmentStatus(
//                shipmentId,
//                request.getStatus()
//        );
//
//        return ApiResponseBuilder.success(response, "Shipment status updated successfully");
//    }
//}