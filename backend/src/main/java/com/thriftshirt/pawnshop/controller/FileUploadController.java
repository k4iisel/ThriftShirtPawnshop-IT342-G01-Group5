package com.thriftshirt.pawnshop.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/upload")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private Cloudinary cloudinary;

    @PostMapping
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please select a file to upload."));
        }

        String originalFilename = file.getOriginalFilename();
        long size = file.getSize();
        logger.info("Received file upload request. Name: {}, Size: {} bytes", originalFilename, size);

        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String url = (String) uploadResult.get("secure_url");
            logger.info("Upload successful. URL: {}", url);
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", url));
        } catch (IOException e) {
            logger.error("Cloudinary upload failed for file: " + originalFilename, e);
            // Include message in response for debugging (dev only, but helpful here)
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Image upload failed: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during file upload", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Unexpected upload error: " + e.getMessage()));
        }
    }
}
