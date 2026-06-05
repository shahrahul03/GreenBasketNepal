package com.greenbasket.nepal.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchRequest {

    private String search;

    private String role;

    private Boolean isActive;

    private Boolean isSuspended;

    private Integer page;

    private Integer size;

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
