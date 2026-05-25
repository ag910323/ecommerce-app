package com.shanti.store.marketplace.request;

import lombok.Data;

@Data
public class OrderPageRequest {
    private int page = 0;
    private int size = 10;
}
