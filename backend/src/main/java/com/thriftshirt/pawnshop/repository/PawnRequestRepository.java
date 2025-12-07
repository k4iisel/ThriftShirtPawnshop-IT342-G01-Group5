package com.thriftshirt.pawnshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.entity.User;

@Repository
public interface PawnRequestRepository extends JpaRepository<PawnRequest, Long> {
    
    // Find all pawn requests by a specific user
    List<PawnRequest> findByUser(User user);
    
    // Find pawn requests by user and status
    List<PawnRequest> findByUserAndStatus(User user, String status);
    
    // Find all pending pawn requests
    List<PawnRequest> findByStatus(String status);
    
    // Check if user has pending pawn requests that could become loans
    @Query("SELECT p FROM PawnRequest p WHERE p.user = :user AND p.status IN ('PENDING', 'APPROVED')")
    List<PawnRequest> findPendingOrApprovedByUser(@Param("user") User user);
}
