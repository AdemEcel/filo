package com.filokiralama.service;

import com.filokiralama.ResourceNotFoundException;
import com.filokiralama.dto.MaintenanceRecordDTO;
import com.filokiralama.model.MaintenanceRecord;
import com.filokiralama.model.MaintenanceStatus;
import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleStatus;
import com.filokiralama.repository.MaintenanceRepository;
import com.filokiralama.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final ModelMapper modelMapper;


    @Transactional(readOnly = true)
    public List<MaintenanceRecordDTO> getMaintenanceHistory(Long vehicleId) {
        return maintenanceRepository.findByVehicleIdOrderByMaintenanceDateDesc(vehicleId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceRecordDTO createMaintenanceRecord(MaintenanceRecordDTO recordDTO) {

        // 1. Araç kontrolü
        Vehicle vehicle = vehicleRepository.findById(recordDTO.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Araç bulunamadı. ID: " + recordDTO.getVehicleId()));

        // 2. Geçerli bakım durumu kontrolü
        MaintenanceStatus status;
        try {
            status = MaintenanceStatus.valueOf(recordDTO.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Geçersiz bakım durumu: '" + recordDTO.getStatus() +
                            "'. Geçerli değerler: " + Arrays.toString(MaintenanceStatus.values())
            );
        }

        // 3. Durum 'IN_PROGRESS' ise araç durumu güncellenir
        if (status == MaintenanceStatus.IN_PROGRESS) {
            if (vehicle.getStatus() == VehicleStatus.RENTED) {
                throw new IllegalStateException("Kiralanmış bir araç bakım durumuna alınamaz.");
            }
            vehicle.setStatus(VehicleStatus.IN_MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        // 4. DTO -> Entity dönüşümü
        MaintenanceRecord record;
        try {
            record = convertToEntity(recordDTO);
        } catch (Exception e) {
            throw new RuntimeException("Bakım kaydı verisi dönüştürülürken hata oluştu: " + e.getMessage());
        }

        // 5. İlişkilendirme ve kayıt
        record.setVehicle(vehicle);
        record.setStatus(status); // DTO'dan gelen status enum olarak ayarlanır

        MaintenanceRecord savedRecord;
        try {
            savedRecord = maintenanceRepository.save(record);
        } catch (Exception e) {
            throw new RuntimeException("Bakım kaydı kaydedilirken bir hata oluştu: " + e.getMessage());
        }

        // 6. Dönüş
        return convertToDto(savedRecord);
    }


    @Transactional
    public MaintenanceRecordDTO updateMaintenanceRecord(Long id, MaintenanceRecordDTO recordDTO) {
        MaintenanceRecord existingRecord = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found"));

        modelMapper.map(recordDTO, existingRecord);

        // Vehicle ilişkisini güncelle
        if (!existingRecord.getVehicle().getId().equals(recordDTO.getVehicleId())) {
            Vehicle vehicle = vehicleRepository.findById(recordDTO.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            existingRecord.setVehicle(vehicle);
        }

        MaintenanceRecord updatedRecord = maintenanceRepository.save(existingRecord);
        return convertToDto(updatedRecord);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecordDTO> getUpcomingMaintenances() {
        LocalDateTime now = LocalDateTime.now(); // Current date and time
        LocalDateTime endDate = now.plusWeeks(2); // Next 2 weeks

        // Find maintenances that are between now and the next 2 weeks
        return maintenanceRepository.findUpcomingMaintenances(now, endDate)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public MaintenanceRecordDTO updateStatus(Long id, String status) {
        MaintenanceRecord maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bakım kaydı bulunamadı"));

        try {
            // String'den enum'a dönüşüm
            MaintenanceStatus newStatus = MaintenanceStatus.valueOf(status.toUpperCase());

            Vehicle vehicle = maintenance.getVehicle(); // Bakım kaydına bağlı aracı al

            // Eğer yeni durum IN_PROGRESS ise, aracın durumunu IN_MAINTENANCE yap
            if (newStatus == MaintenanceStatus.IN_PROGRESS) {
                vehicle.setStatus(VehicleStatus.IN_MAINTENANCE); // Aracın durumunu IN_MAINTENANCE yap
                vehicleRepository.save(vehicle); // Aracı güncelle
            }

            // Bakım kaydının durumunu güncelle
            maintenance.setStatus(newStatus);
            MaintenanceRecord updated = maintenanceRepository.save(maintenance);

            // Eğer yeni durum COMPLETED ise, bakım kaydını tamamla ve araç durumu AVAILABLE yap
            if (newStatus == MaintenanceStatus.COMPLETED) {
                // Aracın bakım kayıtlarının tamamlanıp tamamlanmadığını kontrol et
                boolean allCompleted = maintenanceRepository.findByVehicle(vehicle).stream()
                        .allMatch(record -> record.getStatus() == MaintenanceStatus.COMPLETED);

                // Eğer tüm bakım kayıtları tamamlandıysa, aracın durumunu AVAILABLE yap
                if (allCompleted) {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(vehicle); // Aracın durumunu güncelle
                }
            }

            // Bu kontrol, aracın bakım durumu ne olursa olsun "PLANNED" bakım varsa bile aracı AVAILABLE yapacak
            boolean isAnyInMaintenance = maintenanceRepository.findByVehicle(vehicle).stream()
                    .anyMatch(record -> record.getStatus() == MaintenanceStatus.IN_PROGRESS);

            // Eğer aracın bakım durumu "IN_PROGRESS" veya başka bir bakım durumu varsa, aracın durumunu güncelle
            if (!isAnyInMaintenance) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(vehicle); // Aracın durumunu AVAILABLE yap
            }

            return modelMapper.map(updated, MaintenanceRecordDTO.class);

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Geçersiz durum değeri: " + status +
                    ". Geçerli değerler: " + Arrays.toString(MaintenanceStatus.values()));
        }
    }



    private MaintenanceRecordDTO convertToDto(MaintenanceRecord record) {
        MaintenanceRecordDTO dto = modelMapper.map(record, MaintenanceRecordDTO.class);
        dto.setVehicleId(record.getVehicle().getId());
        dto.setVehiclePlate(record.getVehicle().getPlate());
        return dto;
    }

    private MaintenanceRecord convertToEntity(MaintenanceRecordDTO dto) {
        return modelMapper.map(dto, MaintenanceRecord.class);
    }


}
