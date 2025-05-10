package com.filokiralama.repository;

import com.filokiralama.model.Rental;
import com.filokiralama.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    @Query("SELECT r FROM Rental r WHERE r.vehicle.id = :vehicleId AND r.active = true")
    Optional<Rental> findActiveRentalByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT r FROM Rental r WHERE r.vehicle.id = :vehicleId ORDER BY r.startDate DESC")
    List<Rental> findRentalsByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT r FROM Rental r WHERE r.id = :rentalId AND r.vehicle.id = :vehicleId")
    Optional<Rental> findByIdAndVehicleId(@Param("rentalId") Long rentalId,
                                          @Param("vehicleId") Long vehicleId);

    @Modifying
    @Query("DELETE FROM Rental r WHERE r.vehicle.id = :vehicleId")
    void deleteByVehicleId(@Param("vehicleId") Long vehicleId);

    List<Rental> findByVehicleId(Long vehicleId);

}
