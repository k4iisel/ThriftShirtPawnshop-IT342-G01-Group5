package com.thriftshirt.pawnshop.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.Loan;
import com.thriftshirt.pawnshop.entity.User;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("SELECT SUM(l.loanAmount) FROM Loan l WHERE l.status = :status")
    BigDecimal sumLoanAmountByStatus(@Param("status") String status);

    long countByStatus(String status);
    
    // Find loans by user and status
    @Query("SELECT l FROM Loan l WHERE l.pawnItem.user = :user AND l.status = :status")
    List<Loan> findByPawnItemUserAndStatus(@Param("user") User user, @Param("status") String status);
    
    // Check if user has any pending loans (loans with ACTIVE status)
    @Query("SELECT l FROM Loan l WHERE l.pawnItem.user = :user AND l.status = 'ACTIVE'")
    List<Loan> findActiveLoansByUser(@Param("user") User user);
}
