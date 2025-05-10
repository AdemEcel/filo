package com.filokiralama.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data
public class RentalHistoryDto {
    private Long id;
    private String customerName;
    private String customerTC;
    private String customerPhone;
    private String invoiceNumber;
    private BigDecimal baseAmount;
    private BigDecimal lateFee;
    private String lateFeeDescription;
    private BigDecimal totalAmount;
    private String status;
    private String duration;
    private boolean hasLateFee;

    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate startDate;

    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate endDate;

    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate returnDate;

    public String getFormattedBaseAmount() {
        return String.format("%,.2f ₺", baseAmount);
    }

    public String getFormattedLateFee() {
        return lateFee != null && lateFee.compareTo(BigDecimal.ZERO) > 0 ?
                String.format("%,.2f ₺", lateFee) : "-";
    }

    public String getFormattedTotalAmount() {
        return String.format("%,.2f ₺", totalAmount);
    }

    public String getDuration() {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return days + " gün";
    }
}

