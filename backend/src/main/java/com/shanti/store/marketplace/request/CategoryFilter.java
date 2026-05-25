package com.shanti.store.marketplace.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryFilter extends PaginationRequest {
    private String status;
    private Long parentId;
    private String name;
}
