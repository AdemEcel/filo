package com.filokiralama.service;

import com.filokiralama.BusinessException;
import com.filokiralama.ResourceNotFoundException;
import com.filokiralama.dto.InvoiceResponse;
import com.filokiralama.dto.RentalHistoryDto;
import com.filokiralama.dto.RentalRequest;
import com.filokiralama.dto.RentalResponse;
import com.filokiralama.model.*;
import com.filokiralama.repository.InvoiceRepository;
import com.filokiralama.repository.RentalRepository;
import com.filokiralama.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RentalService {

    private final VehicleRepository vehicleRepo;
    private final RentalRepository rentalRepo;
    private final InvoiceRepository invoiceRepo;
    private final DocumentGenerator docGenerator;
    private final InvoiceGenerator invoiceGenerator;

    @Transactional
    public ResponseEntity<Resource> rentVehicle(Long vehicleId, RentalRequest request) {
        if (vehicleId == null) {
            throw new IllegalArgumentException("Araç ID boş olamaz.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Kiralama isteği boş olamaz.");
        }

        // Gerekli müşteri alanlarının kontrolü
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Müşteri adı boş olamaz.");
        }

        if (request.getCustomerTC() == null || request.getCustomerTC().trim().isEmpty()) {
            throw new IllegalArgumentException("Müşteri T.C. kimlik numarası boş olamaz.");
        }

        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Müşteri telefon numarası boş olamaz.");
        }

        if (request.getEndDate() == null || request.getEndDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Bitiş tarihi bugünden önce olamaz.");
        }

        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Araç bulunamadı (ID: " + vehicleId + ")"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BusinessException("Araç şu anda kiralanabilir durumda değil.");
        }

        try {
            // Kiralama kaydı oluşturuluyor
            Rental rental = new Rental();
            rental.setVehicle(vehicle);
            rental.setCustomerName(request.getCustomerName().trim());
            rental.setCustomerTC(request.getCustomerTC().trim());
            rental.setCustomerPhone(request.getCustomerPhone().trim());
            rental.setStartDate(LocalDate.now());
            rental.setEndDate(request.getEndDate());
            rental.setActive(true);

            rentalRepo.save(rental);

            // Araç durumu güncelleniyor
            vehicle.setStatus(VehicleStatus.RENTED);
            vehicleRepo.save(vehicle);

            // Sözleşme oluşturuluyor ve döndürülüyor
            String contractPath = docGenerator.generateContract(rental);
            Path filePath = Paths.get(contractPath);

            if (!Files.exists(filePath)) {
                throw new FileNotFoundException("Sözleşme dosyası bulunamadı: " + contractPath);
            }

            Resource resource = new FileSystemResource(filePath.toFile());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);

        } catch (IOException e) {
            throw new RuntimeException("Sözleşme dosyası oluşturulurken hata oluştu: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Kiralama işlemi sırasında beklenmeyen bir hata oluştu: " + e.getMessage(), e);
        }
    }


    public InvoiceResponse returnVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        Rental activeRental = rentalRepo.findActiveRentalByVehicleId(vehicleId)
                .orElseThrow(() -> new BusinessException("No active rental found"));

        // Fatura oluştur
        Invoice invoice = invoiceGenerator.generateInvoice(activeRental);
        invoice = invoiceRepo.save(invoice); // Kaydedilen invoice'ı al

        // Kiralama kaydını kapat
        activeRental.setActive(false);
        activeRental.setReturnDate(LocalDate.now());
        rentalRepo.save(activeRental);

        // Araç durumunu güncelle
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepo.save(vehicle);


        return convertToInvoiceResponse(invoice, activeRental, vehicle);
    }

    private InvoiceResponse convertToInvoiceResponse(Invoice invoice, Rental rental, Vehicle vehicle) {
        InvoiceResponse response = new InvoiceResponse();
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setIssueDate(invoice.getIssueDate());
        response.setVehiclePlate(vehicle.getPlate());
        response.setVehicleModel(vehicle.getBrand() + " " + vehicle.getModel());
        response.setCustomerName(rental.getCustomerName());
        response.setRentalDays((int) ChronoUnit.DAYS.between(rental.getStartDate(), rental.getEndDate()) + 1);
        response.setBaseAmount(invoice.getBaseAmount());
        response.setLateFee(invoice.getLateFee());
        response.setLateFeeDescription(invoice.getLateFeeDescription());
        response.setTotalAmount(invoice.getTotalAmount());
        return response;
    }

    public ResponseEntity<Resource> downloadContract(Long vehicleId, Long rentalId) {
        // rentalId null ise aktif kiralama aranacak
        Rental rental = rentalId != null ?
                rentalRepo.findByIdAndVehicleId(rentalId, vehicleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Rental not found")) :
                rentalRepo.findActiveRentalByVehicleId(vehicleId)
                        .orElseThrow(() -> new BusinessException("No active rental found"));

        // Önce yeni formatı dene (rental ID ile)
        String fileName = "sozlesme-" + rental.getId() + ".docx";
        Path filePath = Paths.get("contracts", fileName);

        if (!Files.exists(filePath)) {
            // Eski formatı dene (plaka ile)
            fileName = "sozlesme-" + rental.getVehicle().getPlate().replace(" ", "") + ".docx";
            filePath = Paths.get("contracts", fileName);

            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Contract file not found");
            }
        }

        try {
            Resource resource = new FileSystemResource(filePath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error serving the contract file", e);
        }
    }

    public List<RentalHistoryDto> getRentalHistory(Long vehicleId) {
        List<Rental> rentals = rentalRepo.findRentalsByVehicleId(vehicleId);

        return rentals.stream().map(rental -> {
            RentalHistoryDto dto = new RentalHistoryDto();
            dto.setId(rental.getId());
            dto.setCustomerName(rental.getCustomerName());
            dto.setCustomerTC(rental.getCustomerTC());
            dto.setCustomerPhone(rental.getCustomerPhone());
            dto.setStartDate(rental.getStartDate());
            dto.setEndDate(rental.getEndDate());
            dto.setReturnDate(rental.getReturnDate());

            Invoice invoice = invoiceRepo.findByRentalId(rental.getId()).orElse(null);
            if (invoice != null) {
                dto.setInvoiceNumber(invoice.getInvoiceNumber());
                dto.setBaseAmount(invoice.getBaseAmount());
                dto.setLateFee(invoice.getLateFee());
                dto.setLateFeeDescription(invoice.getLateFeeDescription());
                dto.setTotalAmount(invoice.getTotalAmount());
                dto.setHasLateFee(invoice.getLateFee() != null &&
                        invoice.getLateFee().compareTo(BigDecimal.ZERO) > 0);
            }

            dto.setStatus(rental.isActive() ? "Aktif" :
                    rental.getReturnDate() == null ? "Teslim Edilmedi" : "Tamamlandı");

            return dto;
        }).collect(Collectors.toList());
    }


}