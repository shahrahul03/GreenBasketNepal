package com.greenbasket.nepal.domain.delivery.dto;

import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverySearchRequest {

    private DeliveryStatus status;

    private Long deliveryPartnerId;

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
