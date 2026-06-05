package com.greenbasket.nepal.common.config;

import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.RoleRepository;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@greenbasketnepal.com").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
            if (adminRole == null) {
                log.warn("ADMIN role not found — skipping admin seed");
                return;
            }

            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@greenbasketnepal.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("9812345678")
                    .role(adminRole)
                    .isActive(true)
                    .isEmailVerified(true)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: admin@greenbasketnepal.com / Admin@123");
        }
    }
}
