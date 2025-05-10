package com.filokiralama.controller;

import com.filokiralama.ResourceNotFoundException;
import com.filokiralama.dto.VehicleSaleRequest;
import com.filokiralama.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.filokiralama.service.VehicleSaleService;
import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleSale;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles/sale")
@RequiredArgsConstructor
public class VehicleSaleController {


    @Autowired
    private VehicleSaleService vehicleSaleService;

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/eligible")
    public ResponseEntity<List<Vehicle>> getEligibleForSale(
            @RequestParam(defaultValue = "10") int maxAge,
            @RequestParam(defaultValue = "100000") double minMileage) {
        return ResponseEntity.ok(vehicleSaleService.getVehiclesEligibleForSale(maxAge, minMileage));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping("/{id}/mark-for-sale")
    public ResponseEntity<Vehicle> markForSale(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleSaleService.markForSale(id));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping("/{vehicleId}")
    public ResponseEntity<VehicleSale> sellVehicle(
            @PathVariable Long vehicleId,
            @RequestBody VehicleSaleRequest request) {

        VehicleSale sale = vehicleSaleService.sellVehicle(
                vehicleId,
                request.getCustomerName(),
                request.getCustomerTC(),
                request.getCustomerPhone(),
                request.getSalePrice(),
                request.getPaymentMethod(),
                request.getSaleDate()
        );

        return ResponseEntity.ok(sale);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/{vehicleId}")
    public List<VehicleSale> getSalesByVehicle(@PathVariable Long vehicleId) {
        return vehicleSaleService.getSalesByVehicle(vehicleId);
    }

    @PostMapping("/{vehicleId}/remove-from-sale")
    public ResponseEntity<?> removeFromSale(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleSaleService.removeVehicleFromSale(vehicleId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Vehicle removed from sale"));
    }

}
