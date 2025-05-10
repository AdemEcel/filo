package com.filokiralama.repository;

import com.filokiralama.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByRentalId(Long rentalId);

    @Modifying
    @Query("DELETE FROM Invoice i WHERE i.rental.id = :rentalId")
    void deleteByRentalId(@Param("rentalId") Long rentalId);

    @Modifying
    @Query("DELETE FROM Invoice i WHERE i.rental.vehicle.id = :vehicleId")
    void deleteByVehicleId(@Param("vehicleId") Long vehicleId);

}
