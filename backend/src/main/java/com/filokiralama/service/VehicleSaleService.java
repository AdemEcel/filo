package com.filokiralama.service;

import com.filokiralama.BusinessException;
import com.filokiralama.ResourceNotFoundException;
import com.filokiralama.model.VehicleStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.filokiralama.repository.VehicleRepository;
import com.filokiralama.repository.VehicleSaleRepository;
import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleSale;

import java.time.LocalDate;
import java.util.List;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class VehicleSaleService {
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleSaleRepository vehicleSaleRepository;


    public List<Vehicle> getVehiclesEligibleForSale(int maxAge, double minMileage) {
        int currentYear = Year.now().getValue();
        return vehicleRepository.findEligibleForSale(
                currentYear - maxAge,
                minMileage);
    }

    public Vehicle markForSale(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (vehicle.getStatus() == VehicleStatus.RENTED) {
            throw new BusinessException("Cannot mark a rented vehicle for sale");
        }

        if (vehicle.getStatus() == VehicleStatus.IN_MAINTENANCE) {
            throw new BusinessException("Cannot mark a vehicle in maintenance for sale");
        }

        if (vehicle.getStatus() == VehicleStatus.SOLD) {
            throw new BusinessException("Cannot mark a sold vehicle for sale");
        }

        vehicle.setStatus(VehicleStatus.FOR_SALE);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public VehicleSale sellVehicle(
            Long vehicleId,
            String customerName,
            String customerTC,
            String customerPhone,
            double salePrice,
            String paymentMethod,
            LocalDate saleDate) {

        // 1. Araç kontrolü
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Araç bulunamadı. ID: " + vehicleId));

        // 2. Araç zaten satılmış mı kontrolü
        if (vehicle.getStatus() == VehicleStatus.SOLD) {
            throw new IllegalStateException("Bu araç zaten satılmış.");
        }

        // 3. Satış fiyatı kontrolü
        if (salePrice <= 0) {
            throw new IllegalArgumentException("Satış fiyatı pozitif bir değer olmalıdır.");
        }

        // 4. Müşteri bilgileri kontrolü
        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Müşteri adı boş olamaz.");
        }
        if (customerTC == null || customerTC.trim().length() != 11) {
            throw new IllegalArgumentException("Geçerli bir TC Kimlik Numarası girilmelidir (11 haneli).");
        }
        if (customerPhone == null || customerPhone.trim().length() < 10) {
            throw new IllegalArgumentException("Geçerli bir telefon numarası girilmelidir.");
        }

        // 5. Araç durumunu "SOLD" olarak güncelle
        vehicle.setStatus(VehicleStatus.SOLD);
        vehicleRepository.save(vehicle);

        // 6. Satış kaydını oluştur
        VehicleSale sale = new VehicleSale();
        sale.setVehicle(vehicle);
        sale.setCustomerName(customerName.trim());
        sale.setCustomerTC(customerTC.trim());
        sale.setCustomerPhone(customerPhone.trim());
        sale.setSalePrice(salePrice);
        sale.setPaymentMethod(paymentMethod != null ? paymentMethod.trim() : "Bilinmiyor");
        sale.setSaleDate(saleDate != null ? saleDate : LocalDate.now());

        try {
            return vehicleSaleRepository.save(sale);
        } catch (Exception e) {
            throw new RuntimeException("Satış kaydı kaydedilirken bir hata oluştu: " + e.getMessage(), e);
        }
    }

    public List<VehicleSale> getSalesByVehicle(Long vehicleId) {
        return vehicleSaleRepository.findByVehicleId(vehicleId);
    }

    @Transactional
    public Vehicle removeVehicleFromSale(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        // Sadece FOR_SALE durumundaki araçlar satıştan kaldırılabilir
        if (vehicle.getStatus() != VehicleStatus.FOR_SALE) {
            throw new IllegalStateException("Vehicle is not marked for sale");
        }

        vehicle.setStatus(VehicleStatus.AVAILABLE);
        return vehicleRepository.save(vehicle);
    }


}