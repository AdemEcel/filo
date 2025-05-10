package com.filokiralama.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Rental {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Vehicle vehicle;

    private String customerName;
    private String customerTC;
    private String customerPhone;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate returnDate;

    private boolean active;

}


