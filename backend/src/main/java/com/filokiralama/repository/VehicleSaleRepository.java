package com.filokiralama.repository;

import com.filokiralama.model.VehicleSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleSaleRepository extends JpaRepository<VehicleSale, Long> {
    List<VehicleSale> findByVehicleId(Long vehicleId);

    @Modifying
    @Query("DELETE FROM VehicleSale vs WHERE vs.vehicle.id = :vehicleId")
    void deleteByVehicleId(@Param("vehicleId") Long vehicleId);


}
