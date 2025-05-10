package com.filokiralama.controller;

import com.filokiralama.dto.MaintenanceRecordDTO;
import com.filokiralama.dto.StatusUpdateRequest;
import com.filokiralama.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    @Autowired
    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceRecordDTO>> getMaintenanceHistory(@PathVariable Long vehicleId) {
        List<MaintenanceRecordDTO> records = maintenanceService.getMaintenanceHistory(vehicleId);
        return ResponseEntity.ok(records);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping
    public ResponseEntity<MaintenanceRecordDTO> createMaintenanceRecord(@Valid @RequestBody MaintenanceRecordDTO recordDTO) {
        MaintenanceRecordDTO createdRecord = maintenanceService.createMaintenanceRecord(recordDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRecord);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRecordDTO> updateMaintenanceRecord(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceRecordDTO recordDTO) {
        MaintenanceRecordDTO updatedRecord = maintenanceService.updateMaintenanceRecord(id, recordDTO);
        return ResponseEntity.ok(updatedRecord);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @GetMapping("/upcoming")
    public ResponseEntity<List<MaintenanceRecordDTO>> getUpcomingMaintenances() {
        List<MaintenanceRecordDTO> records = maintenanceService.getUpcomingMaintenances();
        return ResponseEntity.ok(records);
    }


    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceRecordDTO> updateMaintenanceStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        MaintenanceRecordDTO updatedMaintenance = maintenanceService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedMaintenance);
    }
}
