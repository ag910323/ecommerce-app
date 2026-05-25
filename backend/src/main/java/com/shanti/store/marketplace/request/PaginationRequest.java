package com.shanti.store.marketplace.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaginationRequest {
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String direction = "DESC";
}
