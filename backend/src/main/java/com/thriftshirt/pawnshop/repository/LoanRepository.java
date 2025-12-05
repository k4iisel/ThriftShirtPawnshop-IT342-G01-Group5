package com.thriftshirt.pawnshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.thriftshirt.pawnshop.entity.Loan;
import java.math.BigDecimal;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("SELECT SUM(l.loanAmount) FROM Loan l WHERE l.status = :status")
    BigDecimal sumLoanAmountByStatus(@Param("status") String status);

    long countByStatus(String status);
}
