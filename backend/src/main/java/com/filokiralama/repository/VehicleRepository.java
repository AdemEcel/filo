package com.filokiralama.repository;


import com.filokiralama.model.Vehicle;
import com.filokiralama.model.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(VehicleStatus status);
    boolean existsByPlate(String plate);


    @Query("SELECT v FROM Vehicle v WHERE v.year <= :maxYear AND v.mileage >= :minMileage AND v.status <> 'SOLD'")
    List<Vehicle> findEligibleForSale(
            @Param("maxYear") int maxYear,
            @Param("minMileage") double minMileage);
}