package com.filokiralama.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaintenanceRecordDTO {
    private Long id;
    private Long vehicleId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime maintenanceDate;

    private String maintenanceType; // "ROUTINE", "REPAIR", "ACCIDENT"
    private String description;
    private BigDecimal cost;
    private String serviceCenter;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime nextMaintenanceDate;

    private Integer mileage;
    private String status; // "PLANNED", "IN_PROGRESS", "COMPLETED"

    private String vehiclePlate;
}
