package com.thriftshirt.pawnshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.TransactionLog;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog, Long> {
    // Fetch logs ordered by timestamp descending (newest first)
    List<TransactionLog> findAllByOrderByTimestampDesc();
    
    // Fetch user-specific logs ordered by timestamp descending
    @Query("SELECT t FROM TransactionLog t WHERE t.user.id = :userId ORDER BY t.timestamp DESC")
    List<TransactionLog> findByUserIdOrderByTimestampDesc(@Param("userId") Long userId);
    
    // Find transaction log by ID and user ID
    @Query("SELECT t FROM TransactionLog t WHERE t.logId = :logId AND t.user.id = :userId")
    java.util.Optional<TransactionLog> findByLogIdAndUserId(@Param("logId") Long logId, @Param("userId") Long userId);
    
    // Delete all transaction logs for a specific user
    @Modifying
    void deleteByUserId(Long userId);
}
