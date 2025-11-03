package com.thriftshirt.pawnshop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thriftshirt.pawnshop.dto.request.ChangePasswordRequest;
import com.thriftshirt.pawnshop.dto.request.LoginRequest;
import com.thriftshirt.pawnshop.dto.request.RegisterRequest;
import com.thriftshirt.pawnshop.dto.response.AuthResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.UserRepository;
import com.thriftshirt.pawnshop.security.JwtTokenProvider;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String jwt = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();
        
        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String jwt = tokenProvider.generateTokenFromUsername(savedUser.getUsername());
        
        return new AuthResponse(jwt, savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole().name());
    }
    
    public UserProfileResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        return new UserProfileResponse(user);
    }
    
    public void changePassword(String username, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        // Check if new passwords match
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }
    
    public UserProfileResponse updateProfile(String username, UserProfileResponse profileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        // Update user details
        if (profileRequest.getFirstName() != null) {
            user.setFirstName(profileRequest.getFirstName());
        }
        if (profileRequest.getLastName() != null) {
            user.setLastName(profileRequest.getLastName());
        }
        if (profileRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(profileRequest.getPhoneNumber());
        }
        if (profileRequest.getAddress() != null) {
            user.setAddress(profileRequest.getAddress());
        }
        
        User updatedUser = userRepository.save(user);
        return new UserProfileResponse(updatedUser);
    }
}