package com.thriftshirt.pawnshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.entity.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface PawnRequestRepository extends JpaRepository<PawnRequest, Long> {
    
    // Find all pawn requests by a specific user
    List<PawnRequest> findByUser(User user);
    
    // Find pawn requests by user and status
    List<PawnRequest> findByUserAndStatus(User user, String status);
    
    // Find a pawn request by ID
    Optional<PawnRequest> findById(Long pawnId);
    
    // Find all pending pawn requests
    List<PawnRequest> findByStatus(String status);
}
