package com.filokiralama.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentalRequest {
    @NotBlank
    private String customerName;

    @NotBlank
    private String customerTC;

    @NotBlank
    private String customerPhone;

    @Future
    private LocalDate endDate;

}
