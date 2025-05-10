package com.filokiralama.service;


import com.filokiralama.model.Rental;
import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleStatus;
import com.filokiralama.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleSaleRepository vehicleSaleRepository;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private RentalRepository rentalRepository; // Yeni eklenen
    @Autowired
    private InvoiceRepository invoiceRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Transactional
    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicle == null) {
            throw new IllegalArgumentException("Araç bilgisi boş olamaz.");
        }

        // Marka kontrolü
        if (vehicle.getBrand() == null || vehicle.getBrand().trim().isEmpty()) {
            throw new IllegalArgumentException("Araç markası boş olamaz.");
        }

        // Model kontrolü
        if (vehicle.getModel() == null || vehicle.getModel().trim().isEmpty()) {
            throw new IllegalArgumentException("Araç modeli boş olamaz.");
        }

        // Plaka kontrolü (benzersizlik kontrolü örneği)
        if (vehicle.getPlate() == null || vehicle.getPlate().trim().isEmpty()) {
            throw new IllegalArgumentException("Araç plakası boş olamaz.");
        }

        boolean plateExists = vehicleRepository.existsByPlate(vehicle.getPlate().trim());
        if (plateExists) {
            throw new IllegalStateException("Bu plakaya sahip bir araç zaten kayıtlı: " + vehicle.getPlate());
        }

        // Yıl, kilometre ve fiyat gibi sayısal değerlerin kontrolü
        if (vehicle.getYear() <= 1900 || vehicle.getYear() > LocalDate.now().getYear() + 1) {
            throw new IllegalArgumentException("Geçerli bir üretim yılı giriniz.");
        }

        if (vehicle.getDailyPrice() <= 0) {
            throw new IllegalArgumentException("Günlük fiyat pozitif bir değer olmalıdır.");
        }

        if (vehicle.getMileage() < 0) {
            throw new IllegalArgumentException("Kilometre negatif olamaz.");
        }

        try {
            return vehicleRepository.save(vehicle);
        } catch (Exception e) {
            throw new RuntimeException("Araç kaydedilirken bir hata oluştu: " + e.getMessage(), e);
        }
    }



    @Transactional
    public void deleteVehicleWithAllDependencies(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Araç bulunamadı"));

        // Kiralama kayıtları ve faturalandırmalar
        List<Rental> rentals = rentalRepository.findByVehicleId(vehicleId);
        for (Rental rental : rentals) {
            invoiceRepository.deleteByRentalId(rental.getId());
        }

        rentalRepository.deleteAll(rentals); // daha güvenli ve performanslı

        // Diğer bağımlılıkları sil
        vehicleSaleRepository.deleteByVehicleId(vehicleId);
        maintenanceRepository.deleteByVehicleId(vehicleId);

        // Aracı sil
        vehicleRepository.delete(vehicle);
    }




}
