package com.filokiralama.controller;

import com.filokiralama.dto.InvoiceResponse;
import com.filokiralama.dto.RentalHistoryDto;
import com.filokiralama.dto.RentalRequest;
import com.filokiralama.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping("/vehicles/{vehicleId}/rent")
    public ResponseEntity<Resource> rentVehicle(
            @PathVariable Long vehicleId,
            @RequestBody RentalRequest request) {
        return rentalService.rentVehicle(vehicleId, request);
    }


    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/vehicles/{vehicleId}/contract")
    public ResponseEntity<Resource> downloadActiveContract(@PathVariable Long vehicleId) {
        return rentalService.downloadContract(vehicleId, null);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/vehicles/{vehicleId}/contracts/{rentalId}")
    public ResponseEntity<Resource> downloadRentalContract(
            @PathVariable Long vehicleId,
            @PathVariable Long rentalId) {
        return rentalService.downloadContract(vehicleId, rentalId);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping("/vehicles/{vehicleId}/return")
    public InvoiceResponse returnVehicle(@PathVariable Long vehicleId) {
        return rentalService.returnVehicle(vehicleId);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/vehicles/{vehicleId}/rentals")
    public ResponseEntity<List<RentalHistoryDto>> getRentalHistory(
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(rentalService.getRentalHistory(vehicleId));
    }
}