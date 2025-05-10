package com.filokiralama.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Vehicle vehicle;

    // Müşteri bilgileri (User entity yerine doğrudan alanlar)
    private String customerName;
    private String customerTC; // TC Kimlik No
    private String customerPhone;

    private LocalDate saleDate;
    private double salePrice;
    private String paymentMethod; // "CASH", "CREDIT", "LOAN" gibi değerler
}