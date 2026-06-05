package com.greenbasket.nepal.domain.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {

    private String search;

    private Long categoryId;

    private Long sellerId;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private Boolean isOrganic;

    private Boolean isAvailable;

    private String category;

    private Integer page;

    private Integer size;

    private String sort;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private Sort.Direction sortDirection = Sort.Direction.DESC;

    public int getPage() {
        return page != null ? page : 0;
    }

    public int getSize() {
        return size != null ? size : 20;
    }
}
