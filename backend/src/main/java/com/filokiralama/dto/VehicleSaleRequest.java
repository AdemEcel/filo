package com.filokiralama.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleSaleRequest {
    private String customerName;
    private String customerTC;
    private String customerPhone;
    private double salePrice;
    private String paymentMethod; // "CASH", "CREDIT", "LOAN"
    private LocalDate saleDate;

}
