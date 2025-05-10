package com.filokiralama;


import com.filokiralama.model.ERole;
import com.filokiralama.model.Role;
import com.filokiralama.model.User;
import com.filokiralama.repository.RoleRepository;
import com.filokiralama.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;

    // DataInitializer.java'ya ekleyin
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor'a ekleyin
    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);

            Role employeeRole = new Role();
            employeeRole.setName(ERole.ROLE_EMPLOYEE);
            roleRepository.save(employeeRole);

            Role customerRole = new Role();
            customerRole.setName(ERole.ROLE_CUSTOMER);
            roleRepository.save(customerRole);
        }
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@filokiralama.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }
    }
}
