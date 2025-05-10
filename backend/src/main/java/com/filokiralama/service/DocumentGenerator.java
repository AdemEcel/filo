package com.filokiralama.service;

import com.filokiralama.model.Rental;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Component
public class DocumentGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String CONTRACTS_DIR = "contracts";

    public String generateContract(Rental rental) throws IOException {
        XWPFDocument document = new XWPFDocument();

        // Belge genel ayarlar
        setDocumentSettings(document);

        // Başlık ve taraflar bölümü
        addTitle(document);
        addPartiesSection(document, rental);

        // Araç ve kiralama bilgileri
        addVehicleDetails(document, rental);
        addRentalDetails(document, rental);

        // Şartlar ve hükümler
        addTermsAndConditions(document);

        // İmza bölümü
        addSignatureSection(document, rental.getCustomerName());

        // Dipnot
        addFooter(document, rental.getId());

        // Dosyayı kaydet
        return saveDocument(document, rental);
    }

    private void setDocumentSettings(XWPFDocument document) {
        // Sayfa kenar boşlukları
        CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.addNewPgMar();
        pageMar.setLeft(BigInteger.valueOf(1440));  // 2.54 cm
        pageMar.setRight(BigInteger.valueOf(1440));
        pageMar.setTop(BigInteger.valueOf(1440));
        pageMar.setBottom(BigInteger.valueOf(1440));
    }

    private void addTitle(XWPFDocument document) {
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        title.setSpacingAfter(800);

        XWPFRun titleRun = title.createRun();
        titleRun.setText("ARAÇ KİRALAMA SÖZLEŞMESİ");
        titleRun.setBold(true);
        titleRun.setFontSize(18);
        titleRun.setFontFamily("Arial");
        titleRun.setColor("0066CC");
    }

    private void addPartiesSection(XWPFDocument document, Rental rental) {
        // Tablo oluştur
        XWPFTable table = document.createTable(3, 2);
        table.setWidth("100%");

        // Tablo stilleri
        CTTblPr tblPr = table.getCTTbl().getTblPr();
        CTTblBorders borders = tblPr.addNewTblBorders();
        borders.addNewBottom().setVal(STBorder.SINGLE);
        borders.addNewLeft().setVal(STBorder.SINGLE);
        borders.addNewRight().setVal(STBorder.SINGLE);
        borders.addNewTop().setVal(STBorder.SINGLE);
        borders.addNewInsideH().setVal(STBorder.SINGLE);
        borders.addNewInsideV().setVal(STBorder.SINGLE);

        // KİRAYA VEREN bilgileri
        setCell(table, 0, 0, "KİRAYA VEREN (FİRMA)", true);
        setCell(table, 0, 1, "FİLO KİRALAMA A.Ş.", false);

        setCell(table, 1, 0, "Adres", true);
        setCell(table, 1, 1, "Örnek Mah. Demo Cad. No:123 İstanbul", false);

        setCell(table, 2, 0, "KİRACI (MÜŞTERİ)", true);
        setCell(table, 2, 1, rental.getCustomerName(), false);

        // Tablodan sonra boşluk
        document.createParagraph().setSpacingAfter(400);
    }

    private void addVehicleDetails(XWPFDocument document, Rental rental) {
        addSectionTitle(document, "ARAÇ BİLGİLERİ");

        XWPFTable table = document.createTable(4, 2);
        table.setWidth("100%");

        setCell(table, 0, 0, "Plaka", true);
        setCell(table, 0, 1, rental.getVehicle().getPlate(), false);

        setCell(table, 1, 0, "Marka/Model", true);
        setCell(table, 1, 1, rental.getVehicle().getBrand() + " " + rental.getVehicle().getModel(), false);

        setCell(table, 2, 0, "Model Yılı", true);
        setCell(table, 2, 1, String.valueOf(rental.getVehicle().getYear()), false);

        setCell(table, 3, 0, "Günlük Ücret", true);
        setCell(table, 3, 1, rental.getVehicle().getDailyPrice() + " TL", false);

        document.createParagraph().setSpacingAfter(400);
    }

    private void addRentalDetails(XWPFDocument document, Rental rental) {
        addSectionTitle(document, "KİRALAMA BİLGİLERİ");

        XWPFTable table = document.createTable(4, 2);
        table.setWidth("100%");

        setCell(table, 0, 0, "Kiralama Başlangıç", true);
        setCell(table, 0, 1, rental.getStartDate().format(DATE_FORMATTER), false);

        setCell(table, 1, 0, "Planlanan Teslim", true);
        setCell(table, 1, 1, rental.getEndDate().format(DATE_FORMATTER), false);

        setCell(table, 2, 0, "Kiralama Süresi", true);
        setCell(table, 2, 1,
                ChronoUnit.DAYS.between(rental.getStartDate(), rental.getEndDate()) + 1 + " gün", false);

        setCell(table, 3, 0, "Tahmini Toplam Tutar", true);
        setCell(table, 3, 1,
                rental.getVehicle().getDailyPrice() *
                        (ChronoUnit.DAYS.between(rental.getStartDate(), rental.getEndDate()) + 1) + " TL", false);

        document.createParagraph().setSpacingAfter(400);
    }

    private void addTermsAndConditions(XWPFDocument document) {
        addSectionTitle(document, "SÖZLEŞME ŞARTLARI");

        String[] terms = {
                "1. Araç, belirtilen tarihte teslim edilecek ve alınacaktır.",
                "2. Kiracı, aracı trafik kurallarına uygun şekilde kullanacak ve her türlü kural ihlalinden sorumlu olacaktır.",
                "3. Araçta meydana gelebilecek her türlü hasar, kaza ve kayıplardan kiracı sorumludur.",
                "4. Araç, teslim alındığı yakıt seviyesinde ve temizlikte teslim edilecektir.",
                "5. Geç teslim durumunda, günlük ücretin %150'si kadar ceza uygulanacaktır.",
                "6. Kiracı, aracı üçüncü şahıslara kullandıramaz ve başka amaçla kullanamaz.",
                "7. Araçta herhangi bir teknik arıza oluşması durumunda derhal firma bilgilendirilecektir.",
                "8. Sigorta kapsamı dışında kalan hasarlar kiracı tarafından karşılanacaktır.",
                "9. Araç içinde sigara içilmesi yasaktır ve bu durumda temizlik ücreti alınacaktır.",
        };

        for (String term : terms) {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setSpacingAfter(100);
            paragraph.setIndentationLeft(200);

            XWPFRun run = paragraph.createRun();
            run.setText(term);
        }
    }

    private void addSignatureSection(XWPFDocument document, String customerName) {
        addSectionTitle(document, "TARAFLARCA ONAY");

        XWPFTable table = document.createTable(1, 2);
        table.setWidth("100%");

        // Firma imza bölümü
        String[] companySignature = {
                "KİRAYA VEREN:",
                "FİLO KİRALAMA A.Ş.",
                "",
                "Ad-Soyad: ____________________________",
                "",
                "İmza: ___________________",
                "Tarih: ___/___/_____"
        };

        // Müşteri imza bölümü
        String[] customerSignature = {
                "KİRACI",
                "",
                "Ad-Soyad: " + customerName,
                "",
                "İmza: ___________________",
                "Tarih: ___/___/_____"
        };

        setMultiLineCell(table.getRow(0).getCell(0), companySignature);
        setMultiLineCell(table.getRow(0).getCell(1), customerSignature);
    }

    private void setMultiLineCell(XWPFTableCell cell, String[] lines) {
        cell.removeParagraph(0);
        for (String line : lines) {
            XWPFParagraph para = cell.addParagraph();
            para.setAlignment(ParagraphAlignment.LEFT);

            XWPFRun run = para.createRun();
            run.setText(line);
            run.setFontSize(12);
            run.setFontFamily("Arial");
        }
    }


    private void addFooter(XWPFDocument document, Long rentalId) {
        XWPFParagraph footer = document.createParagraph();
        footer.setAlignment(ParagraphAlignment.CENTER);
        footer.setSpacingBefore(500);

        XWPFRun run = footer.createRun();
        run.setText("Bu sözleşme elektronik ortamda düzenlenmiş olup, taraflarca kabul edilmiştir.");
        run.setItalic(true);
        run.setFontSize(10);
        run.addBreak();
        run.setText("Sözleşme No: CONT-" + rentalId + " | Düzenlenme Tarihi: " +
                java.time.LocalDate.now().format(DATE_FORMATTER));
    }

    private String saveDocument(XWPFDocument document, Rental rental) throws IOException {
        String fileName = "sozlesme-" + rental.getId() + ".docx";
        Path dirPath = Paths.get(CONTRACTS_DIR);

        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        Path filePath = dirPath.resolve(fileName);

        try (FileOutputStream out = new FileOutputStream(filePath.toFile())) {
            document.write(out);
        }

        return filePath.toString();
    }

    private void addSectionTitle(XWPFDocument document, String title) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingBefore(400);

        XWPFRun run = paragraph.createRun();
        run.setText(title);
        run.setBold(true);
        run.setFontSize(14);
        run.setColor("0066CC");
        run.addBreak();
    }

    private void setCell(XWPFTable table, int row, int col, String text, boolean bold) {
        XWPFTableCell cell = table.getRow(row).getCell(col);
        if (cell == null) cell = table.getRow(row).addNewTableCell();

        cell.removeParagraph(0);
        XWPFParagraph para = cell.addParagraph();
        para.setAlignment(ParagraphAlignment.LEFT);

        XWPFRun run = para.createRun();
        run.setText(text);
        run.setFontSize(12);
        run.setFontFamily("Arial");
        if (bold) run.setBold(true);
    }
}