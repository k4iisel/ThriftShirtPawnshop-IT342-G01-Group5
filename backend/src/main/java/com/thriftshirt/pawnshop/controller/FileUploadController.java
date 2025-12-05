package com.thriftshirt.pawnshop.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.thriftshirt.pawnshop.dto.response.ApiResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);
    private final Path fileStorageLocation;

    public FileUploadController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please select a file to upload."));
        }

        // Validate file type (image only)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed."));
        }

        try {
            // Normalize and sanitize filename
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

            // Generate unique filename to avoid collisions
            String fileExtension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = originalFileName.substring(i);
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Copy file to target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Generate file URI
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileDownloadUri));

        } catch (IOException ex) {
            logger.error("Could not upload file: " + file.getOriginalFilename(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Could not upload file. Please try again."));
        }
    }
}
