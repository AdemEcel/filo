package com.filokiralama;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Test profili kullan
public class FiloKiralamaBackendApplicationTests {

	@Test
	public void contextLoads() {
		// Bu test sadece bağlamın yüklenip yüklenmediğini kontrol eder
	}
}