package com.thriftshirt.pawnshop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.*;
import java.util.*;

@RestController
// Accept both routes so requests missing the '/api' prefix still reach the controller
@RequestMapping({"/api/pawnrequests", "/pawnrequests"})
@CrossOrigin(origins = "*")
public class PawnRequestController {

    private static final Logger log = LoggerFactory.getLogger(PawnRequestController.class);

    @Autowired
    private PawnRequestRepository pawnRequestRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPawnRequest(
            HttpServletRequest httpServletRequest,
            @RequestParam String itemName,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String requestedAmount,
            @RequestParam(required = false) String estimatedValue,
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) {
        // Log the incoming request URI to make it easier to debug requests
        log.info("Incoming pawn request to: {}, servletPath: {}, requestURI: {}",
                httpServletRequest.getRequestURI(),
                httpServletRequest.getServletPath(),
                httpServletRequest.getRequestURI());

        try {
            // Basic validation
            if (itemName == null || itemName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "itemName is required"));
            }

            PawnRequest pawnRequest = new PawnRequest();
            pawnRequest.setItemName(itemName);
            pawnRequest.setBrand(brand);
            pawnRequest.setSize(size);
            pawnRequest.setCondition(condition);
            pawnRequest.setDescription(description);
            pawnRequest.setStatus("Pending");

            // Safe parse numeric values
            Double requestedAmt = null;
            Double estimatedVal = null;
            try {
                if (requestedAmount != null && !requestedAmount.trim().isEmpty()) {
                    requestedAmt = Double.parseDouble(requestedAmount.trim());
                }
            } catch (NumberFormatException nfe) {
                return ResponseEntity.badRequest().body(Map.of("message", "requestedAmount is invalid"));
            }
            try {
                if (estimatedValue != null && !estimatedValue.trim().isEmpty()) {
                    estimatedVal = Double.parseDouble(estimatedValue.trim());
                }
            } catch (NumberFormatException nfe) {
                return ResponseEntity.badRequest().body(Map.of("message", "estimatedValue is invalid"));
            }

            pawnRequest.setRequestedAmount(requestedAmt);
            pawnRequest.setEstimatedValue(estimatedVal);

            // Persist early to obtain an ID which we use for file storage path
            pawnRequest = pawnRequestRepository.save(pawnRequest);

            List<String> savedPaths = new ArrayList<>();
            if (images != null && images.length > 0) {
                Path uploadDir = Paths.get("uploads", "pawn_images", String.valueOf(pawnRequest.getPawnId()));
                try {
                    Files.createDirectories(uploadDir);
                } catch (Exception e) {
                    log.error("Unable to create directories for upload path", e);
                    // Clean up DB record since we can't store file
                    pawnRequestRepository.deleteById(pawnRequest.getPawnId());
                    return ResponseEntity.status(500).body(Map.of("message", "Unable to create upload directory on server"));
                }

                for (MultipartFile image : images) {
                    if (image == null || image.isEmpty()) continue;
                    String original = Paths.get(image.getOriginalFilename()).getFileName().toString();
                    String filename = System.currentTimeMillis() + "_" + original;
                    Path destination = uploadDir.resolve(filename);
                    try {
                        Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                        savedPaths.add("/uploads/pawn_images/" + pawnRequest.getPawnId() + "/" + filename);
                    } catch (Exception e) {
                        log.error("Failed to save uploaded file: " + original, e);
                        // Attempt cleanup: delete uploaded files and DB record
                        try {
                            // delete any saved files for this request
                            for (String p : savedPaths) {
                                try {
                                    // p is "/uploads/pawn_images/{id}/{file}"
                                    Path toDelete = Paths.get(".", p.replaceFirst("/", ""));
                                    Files.deleteIfExists(toDelete);
                                } catch (Exception ex) {
                                    log.warn("Failed to delete file during cleanup: " + p, ex);
                                }
                            }
                            pawnRequestRepository.deleteById(pawnRequest.getPawnId());
                        } catch (Exception cleanupEx) {
                            log.warn("Failed to cleanup after file save failure", cleanupEx);
                        }
                        return ResponseEntity.status(500).body(Map.of("message", "Failed to save uploaded file(s)"));
                    }
                } // end images loop
            } // end images check

            if (!savedPaths.isEmpty()) {
                String photoJson = objectMapper.writeValueAsString(savedPaths);
                pawnRequest.setPhotos(photoJson);
            }

            pawnRequest = pawnRequestRepository.save(pawnRequest);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", pawnRequest.getPawnId());
            resp.put("photos", savedPaths);

            return ResponseEntity.status(201).body(resp);
        } catch (Exception e) {
            log.error("Error creating Pawn Request: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Error creating Pawn Request: " + e.getMessage()));
        }
    }
}
