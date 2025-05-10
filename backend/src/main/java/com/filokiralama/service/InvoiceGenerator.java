package com.filokiralama.service;

import com.filokiralama.BusinessException;
import com.filokiralama.model.Invoice;
import com.filokiralama.model.Rental;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
public class InvoiceGenerator {

    public Invoice generateInvoice(Rental rental) {

        if (rental == null) {
            throw new IllegalArgumentException("Rental cannot be null");
        }
        if (rental.getVehicle() == null) {
            throw new BusinessException("Rental must have a vehicle assigned");
        }

        LocalDate today = LocalDate.now();
        LocalDate endDate = rental.getEndDate();

        if (endDate.isBefore(rental.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }

        // Kiralanan gün sayısı
        int plannedDays = (int) ChronoUnit.DAYS.between(rental.getStartDate(), endDate) + 1;

        // Günlük ücret
        double dailyPrice = rental.getVehicle().getDailyPrice(); // double değeri al
        BigDecimal dailyRate = BigDecimal.valueOf(dailyPrice);
        // Planlanan kira tutarı
        BigDecimal rentalAmount = dailyRate.multiply(BigDecimal.valueOf(plannedDays));

        // Geç teslim cezası hesaplama
        BigDecimal lateFee = BigDecimal.ZERO;
        String lateFeeDesc = null;

        // Eğer bugün, planlanan bitiş tarihinden sonraysa
        if (today.isAfter(endDate)) {
            int lateDays = (int) ChronoUnit.DAYS.between(endDate, today);

            if (lateDays > 0) {
                // Geç gün başına günlük ücretin %50'si
                BigDecimal dailyLateFee = dailyRate.multiply(BigDecimal.valueOf(1.5));
                lateFee = dailyLateFee.multiply(BigDecimal.valueOf(lateDays));
                lateFeeDesc = String.format("%d gün geç teslim (%s TL/gün)",
                        lateDays, dailyLateFee);
            }
        }

        // Toplam tutar
        BigDecimal totalAmount = rentalAmount.add(lateFee);

        // Fatura oluşturma
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setIssueDate(today);
        invoice.setRental(rental);
        invoice.setBaseAmount(rentalAmount);
        invoice.setLateFee(lateFee);
        invoice.setLateFeeDescription(lateFeeDesc);
        invoice.setTotalAmount(totalAmount);

        return invoice;
    }

    private String generateInvoiceNumber() {
        LocalDate now = LocalDate.now();
        return String.format("INV-%d%02d%02d-%s",
                now.getYear(), now.getMonthValue(), now.getDayOfMonth(),
                UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    }
}