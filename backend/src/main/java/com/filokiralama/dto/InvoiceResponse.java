package com.filokiralama.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceResponse {
    private String invoiceNumber;
    private LocalDate issueDate;
    private String vehiclePlate;
    private String vehicleModel;
    private String customerName;
    private int rentalDays;
    private BigDecimal baseAmount;
    private BigDecimal lateFee;
    private String lateFeeDescription;
    private BigDecimal totalAmount;
}