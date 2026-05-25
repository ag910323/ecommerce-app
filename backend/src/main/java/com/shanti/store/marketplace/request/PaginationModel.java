package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationModel {

    private Integer page = 0;        // Default: first page
    private Integer size = 10;       // Default: 10 records per page
    private String sortBy = "id";    // Default: sort by id
    private String sortDir = "asc";  // asc or desc
}
