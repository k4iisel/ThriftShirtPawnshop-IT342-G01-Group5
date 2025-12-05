package com.thriftshirt.pawnshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.TransactionLog;
import java.util.List;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog, Long> {
    // Fetch logs ordered by timestamp descending (newest first)
    List<TransactionLog> findAllByOrderByTimestampDesc();
}
