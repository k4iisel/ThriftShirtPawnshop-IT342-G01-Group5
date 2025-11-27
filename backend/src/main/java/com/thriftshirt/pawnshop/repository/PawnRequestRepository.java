package com.thriftshirt.pawnshop.repository;

import com.thriftshirt.pawnshop.entity.PawnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PawnRequestRepository extends JpaRepository<PawnRequest, Long> {
    // Basic CRUD supported by JpaRepository
}
