package com.filokiralama.dto;

import com.filokiralama.model.Rental;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RentalResponse {
    private Long id;
    private String vehiclePlate;
    private String customerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String contractContent;  // HTML içeriği için (eski)
    private String contractFilePath; // DOCX dosya yolu (yeni)

    public static RentalResponse fromRental(Rental rental, String contractContent) {
        RentalResponse response = new RentalResponse();
        response.setId(rental.getId());
        response.setVehiclePlate(rental.getVehicle().getPlate());
        response.setCustomerName(rental.getCustomerName());
        response.setStartDate(rental.getStartDate());
        response.setEndDate(rental.getEndDate());
        response.setContractContent(contractContent);
        return response;
    }
}

