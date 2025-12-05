package com.thriftshirt.pawnshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.Loan;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    // Basic CRUD is provided by JpaRepository
}
