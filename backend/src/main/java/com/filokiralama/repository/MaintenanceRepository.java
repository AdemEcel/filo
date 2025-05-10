package com.filokiralama.repository;

import com.filokiralama.model.MaintenanceRecord;
import com.filokiralama.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByVehicle(Vehicle vehicle);

    List<MaintenanceRecord> findByVehicleIdOrderByMaintenanceDateDesc(Long vehicleId);

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.nextMaintenanceDate >= :startDate AND m.nextMaintenanceDate <= :endDate ORDER BY m.nextMaintenanceDate ASC")
    List<MaintenanceRecord> findUpcomingMaintenances(LocalDateTime startDate, LocalDateTime endDate);

    @Modifying
    @Query("DELETE FROM MaintenanceRecord m WHERE m.vehicle.id = :vehicleId")
    void deleteByVehicleId(@Param("vehicleId") Long vehicleId);

}
