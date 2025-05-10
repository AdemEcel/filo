package com.filokiralama.controller;


import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleStatus;
import com.filokiralama.repository.VehicleRepository;
import com.filokiralama.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;

    @Autowired
    private VehicleRepository vehicleRepository;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }


    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'CUSTOMER')")
    @GetMapping
    public List<Vehicle> getAllVehicles(Authentication authentication) {
        boolean isCustomer = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_CUSTOMER"));

        if (isCustomer) {
            return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE);
        } else {
            return vehicleRepository.findAll();
        }
    }


    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public Vehicle addVehicle(@RequestBody Vehicle vehicle) {
        return vehicleService.addVehicle(vehicle);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{vehicleId}")
    @Transactional
    public ResponseEntity<?> deleteVehicle(@PathVariable Long vehicleId) {
        try {
            vehicleService.deleteVehicleWithAllDependencies(vehicleId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Araç silinirken hata oluştu: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle updatedVehicle) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Araç bulunamadı"));

        // Alanları güncelle
        existing.setBrand(updatedVehicle.getBrand());
        existing.setModel(updatedVehicle.getModel());
        existing.setYear(updatedVehicle.getYear());
        existing.setPlate(updatedVehicle.getPlate());
        existing.setDailyPrice(updatedVehicle.getDailyPrice());
        existing.setMileage(updatedVehicle.getMileage());

        vehicleRepository.save(existing);

        return ResponseEntity.ok(existing);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);

        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            // Sadece durumu döndürmek istersen:
            Map<String, Object> response = new HashMap<>();
            response.put("id", vehicle.getId());
            response.put("status", vehicle.getStatus());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Araç bulunamadı.");
        }
    }


}