package com.filokiralama.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;

    private LocalDate issueDate;

    @ManyToOne
    private Rental rental;

    // Ana kiralama tutarı (günlük ücret x gün sayısı)
    private BigDecimal baseAmount;

    // Geç teslim cezası
    private BigDecimal lateFee;

    // Geç teslim cezası açıklaması
    private String lateFeeDescription;

    // Toplam tutar (baseAmount + lateFee)
    private BigDecimal totalAmount;
}