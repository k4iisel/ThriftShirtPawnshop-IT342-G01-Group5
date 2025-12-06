package com.thriftshirt.pawnshop.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        try {
            logger.info("Creating pawn request for user ID: {}", userId);
            logger.debug("Request data - Item: {}, Brand: {}, Size: {}, Condition: {}",
                    requestDTO.getItemName(), requestDTO.getBrand(), requestDTO.getSize(), requestDTO.getCondition());

            pawnRequest.setUser(user);
            pawnRequest.setItemName(requestDTO.getItemName());
            pawnRequest.setBrand(requestDTO.getBrand() != null ? requestDTO.getBrand() : "Unknown");
            pawnRequest.setSize(requestDTO.getSize());
            pawnRequest.setCondition(requestDTO.getCondition());
            pawnRequest.setDescription(requestDTO.getDescription());
            pawnRequest.setPhotos(requestDTO.getPhotos());
            pawnRequest.setRequestedAmount(requestDTO.getRequestedAmount());
            pawnRequest.setEstimatedValue(requestDTO.getEstimatedValue());
            pawnRequest.setStatus("PENDING"); // Default status
            pawnRequest.setCategory(requestDTO.getCategory() != null ? requestDTO.getCategory() : "General");

            logger.info("Attempting to save pawn request to database...");
            // Save and return
            PawnRequest saved = pawnRequestRepository.save(pawnRequest);
            logger.info("✅ Pawn request created successfully with ID: {}", saved.getPawnId());

            return mapToResponse(saved);

        } catch (Exception e) {
            logger.error("❌ Database error while creating pawn request: {}", e.getMessage());
            logger.error("Error details: ", e);
            throw new RuntimeException("Failed to create pawn request: " + e.getMessage(), e);
        }
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
     * Get all pawn requests (for admin)
     */
    public List<PawnRequestResponse> getAllPawnRequests() {
        logger.info("Fetching all pawn requests");

        return pawnRequestRepository.findAll()
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
     * Get all pawn requests for inventory (APPROVED and FORFEITED items)
     */
    public List<PawnRequestResponse> getInventoryItems() {
        logger.info("Fetching inventory items (APPROVED and FORFEITED status)");

        List<PawnRequest> approvedItems = pawnRequestRepository.findByStatus("APPROVED");
        List<PawnRequest> forfeitedItems = pawnRequestRepository.findByStatus("FORFEITED");
        
        List<PawnRequest> allInventoryItems = new java.util.ArrayList<>();
        allInventoryItems.addAll(approvedItems);
        allInventoryItems.addAll(forfeitedItems);
        
        return allInventoryItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update pawn request status (for admin)
     */
    public PawnRequestResponse updatePawnRequestStatus(Long pawnId, String status, User adminUser) {
        logger.info("Updating pawn request {} status to: {}", pawnId, status);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        pawnRequest.setStatus(status);
        
        // Set appraisal date and appraised by when status is changed to APPROVED
        if ("APPROVED".equals(status)) {
            pawnRequest.setAppraisalDate(LocalDate.now());
            pawnRequest.setAppraisedBy(adminUser.getUsername());
            logger.info("Setting appraisal date for pawn request {}: {} by admin: {}", 
                       pawnId, LocalDate.now(), adminUser.getUsername());
        }
        
        PawnRequest updated = pawnRequestRepository.save(pawnRequest);

        return mapToResponse(updated);
    }
    
    /**
     * Update pawn request status (for admin) - backward compatibility
     */
    public PawnRequestResponse updatePawnRequestStatus(Long pawnId, String status) {
        return updatePawnRequestStatus(pawnId, status, null);
    }

    /**
     * Delete a pawn request (only allowed for PENDING status)
     */
    public void deletePawnRequest(Long pawnId, Long userId) {
        logger.info("Attempting to delete pawn request {} by user {}", pawnId, userId);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        // Verify that the pawn request belongs to the requesting user
        if (!pawnRequest.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own pawn requests");
        }

        // Only allow deletion of PENDING requests
        if (!"PENDING".equals(pawnRequest.getStatus())) {
            throw new BadRequestException("Only pending pawn requests can be deleted");
        }

        logger.info("Deleting pawn request with ID: {}", pawnId);
        pawnRequestRepository.deleteById(pawnId);
        logger.info("✅ Pawn request {} deleted successfully", pawnId);
    }

    /**
     * Get user dashboard statistics
     */
    public Map<String, Object> getUserDashboardStats(Long userId) {
        logger.info("Calculating dashboard stats for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<PawnRequest> userRequests = pawnRequestRepository.findByUser(user);

        // 1. Active Pawns
        long activePawns = userRequests.stream()
                .filter(req -> "PAWNED".equals(req.getStatus()))
                .count();

        // 2. Loan Amount (Total)
        BigDecimal totalLoanAmount = userRequests.stream()
                .filter(req -> "PAWNED".equals(req.getStatus()) && req.getLoan() != null)
                .map(req -> req.getLoan().getLoanAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Due Soon (within 3 days)
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);

        long dueSoon = userRequests.stream()
                .filter(req -> "PAWNED".equals(req.getStatus()) && req.getLoan() != null)
                .filter(req -> {
                    LocalDate dueDate = req.getLoan().getDueDate();
                    return dueDate != null && !dueDate.isBefore(today) && !dueDate.isAfter(threeDaysFromNow);
                })
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("activePawns", activePawns);
        stats.put("loanAmount", totalLoanAmount);
        stats.put("dueSoon", dueSoon);

        return stats;
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
                pawnRequest.getAppraisedBy());
    }
}
