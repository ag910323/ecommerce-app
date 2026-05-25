package com.shanti.store.marketplace.builder;

import org.springframework.http.ResponseEntity;

import com.shanti.store.marketplace.response.ApiResponse;

public class ApiResponseBuilder {

	private ApiResponseBuilder() {
		// utility class, prevent instantiation
	}

	public static <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
		return ResponseEntity.ok(ApiResponse.<T>builder().success(true).message(message).data(data).build());
	}

	public static <T> ResponseEntity<ApiResponse<T>> error(String message) {
		return ResponseEntity.badRequest()
				.body(ApiResponse.<T>builder().success(false).message(message).data(null).build());
	}
}
