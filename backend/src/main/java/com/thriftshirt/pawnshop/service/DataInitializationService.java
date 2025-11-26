package com.thriftshirt.pawnshop.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thriftshirt.pawnshop.entity.Role;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.repository.UserRepository;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Configurable admin credentials from application.properties
    @Value("${app.admin.username}")
    private String defaultAdminUsername;
    
    @Value("${app.admin.email}")
    private String defaultAdminEmail;
    
    @Value("${app.admin.password}")
    private String defaultAdminPassword;
    
    @Value("${app.admin.firstname}")
    private String defaultAdminFirstname;
    
    @Value("${app.admin.lastname}")
    private String defaultAdminLastname;
    
    @Override
    public void run(String... args) throws Exception {
        createDefaultAdmin();
    }
    
    private void createDefaultAdmin() {
        try {
            // Check if admin account already exists
            if (userRepository.findByUsername(defaultAdminUsername).isPresent()) {
                logger.info("Default admin account already exists. Skipping creation.");
                return;
            }
            
            // Check if email is already taken
            if (userRepository.findByEmail(defaultAdminEmail).isPresent()) {
                logger.warn("Default admin email already exists with a different username. Skipping creation.");
                return;
            }
            
            // Create default admin user
            User adminUser = new User();
            adminUser.setUsername(defaultAdminUsername);
            adminUser.setEmail(defaultAdminEmail);
            adminUser.setPassword(passwordEncoder.encode(defaultAdminPassword));
            adminUser.setFirstName(defaultAdminFirstname);
            adminUser.setLastName(defaultAdminLastname);
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            // Save admin user
            User savedAdmin = userRepository.save(adminUser);
            
            logger.info("=======================================================");
            logger.info("DEFAULT ADMIN ACCOUNT CREATED SUCCESSFULLY!");
            logger.info("=======================================================");
            logger.info("Username: {}", defaultAdminUsername);
            logger.info("Email: {}", defaultAdminEmail);
            logger.info("Password: {}", defaultAdminPassword);
            logger.info("Role: {}", savedAdmin.getRole());
            logger.info("=======================================================");
            logger.info("IMPORTANT: Please change the default password after first login!");
            logger.info("=======================================================");
            
        } catch (Exception e) {
            logger.error("Error creating default admin account: {}", e.getMessage(), e);
        }
    }
}