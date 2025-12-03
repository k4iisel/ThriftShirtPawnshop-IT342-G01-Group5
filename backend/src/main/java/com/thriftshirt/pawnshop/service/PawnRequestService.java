package com.thriftshirt.pawnshop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.dto.request.CreatePawnRequestDTO;
import com.thriftshirt.pawnshop.dto.response.PawnRequestResponse;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;
import com.thriftshirt.pawnshop.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PawnRequestService {
    
    private static final Logger logger = LoggerFactory.getLogger(PawnRequestService.class);
    
    @Autowired
    private PawnRequestRepository pawnRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new pawn request
     */
    public PawnRequestResponse createPawnRequest(Long userId, CreatePawnRequestDTO requestDTO) {
        logger.info("Creating pawn request for user: {}", userId);
        
        // Validate input
        if (requestDTO.getRequestedAmount() == null || requestDTO.getRequestedAmount() < 50) {
            throw new BadRequestException("Requested amount must be at least 50");
        }
        
        if (requestDTO.getRequestedAmount() > 10000) {
            throw new BadRequestException("Requested amount cannot exceed 10,000");
        }
        
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Create new pawn request
        PawnRequest pawnRequest = new PawnRequest();
        pawnRequest.setUser(user);
        pawnRequest.setItemName(requestDTO.getItemName());
        pawnRequest.setBrand(requestDTO.getBrand());
        pawnRequest.setSize(requestDTO.getSize());
        pawnRequest.setCondition(requestDTO.getCondition());
        pawnRequest.setDescription(requestDTO.getDescription());
        pawnRequest.setPhotos(requestDTO.getPhotos());
        pawnRequest.setRequestedAmount(requestDTO.getRequestedAmount());
        pawnRequest.setEstimatedValue(requestDTO.getEstimatedValue());
        pawnRequest.setStatus("PENDING"); // Default status
        pawnRequest.setCategory(requestDTO.getCategory() != null ? requestDTO.getCategory() : "General");
        
        // Save and return
        PawnRequest saved = pawnRequestRepository.save(pawnRequest);
        logger.info("Pawn request created successfully with ID: {}", saved.getPawnId());
        
        return mapToResponse(saved);
    }
    
    /**
     * Get all pawn requests for a specific user
     */
    public List<PawnRequestResponse> getUserPawnRequests(Long userId) {
        logger.info("Fetching pawn requests for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return pawnRequestRepository.findByUser(user)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific pawn request by ID
     */
    public PawnRequestResponse getPawnRequestById(Long pawnId) {
        logger.info("Fetching pawn request with ID: {}", pawnId);
        
        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
            .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));
        
        return mapToResponse(pawnRequest);
    }
    
    /**
     * Get all pawn requests with a specific status
     */
    public List<PawnRequestResponse> getPawnRequestsByStatus(String status) {
        logger.info("Fetching pawn requests with status: {}", status);
        
        return pawnRequestRepository.findByStatus(status)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Update pawn request status (for admin)
     */
    public PawnRequestResponse updatePawnRequestStatus(Long pawnId, String status) {
        logger.info("Updating pawn request {} status to: {}", pawnId, status);
        
        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
            .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));
        
        pawnRequest.setStatus(status);
        PawnRequest updated = pawnRequestRepository.save(pawnRequest);
        
        return mapToResponse(updated);
    }
    
    /**
     * Map PawnRequest entity to response DTO
     */
    private PawnRequestResponse mapToResponse(PawnRequest pawnRequest) {
        return new PawnRequestResponse(
            pawnRequest.getPawnId(),
            pawnRequest.getItemName(),
            pawnRequest.getBrand(),
            pawnRequest.getSize(),
            pawnRequest.getCondition(),
            pawnRequest.getCategory(),
            pawnRequest.getDescription(),
            pawnRequest.getRequestedAmount(),
            pawnRequest.getEstimatedValue(),
            pawnRequest.getPhotos(),
            pawnRequest.getStatus(),
            pawnRequest.getAppraisalDate(),
            pawnRequest.getAppraisedBy()
        );
    }
}
